// ─────────────────────────────────────────────────────────────
// Stripe Provider — implémentation PaymentProvider via Stripe
// ─────────────────────────────────────────────────────────────

import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import type { PaymentProvider, CheckoutParams, CustomerPortalParams, PromoResult, PromoCreateData, RefundSubParams } from './types'

function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not defined')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-01-27.acacia' as any,
        typescript: true,
    })
}

export class StripeProvider implements PaymentProvider {
    private get stripe() {
        return getStripe()
    }

    async createOrGetCustomer({ userId, email, name }: { userId: string; email: string; name?: string | null }): Promise<string> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } })
        if (user?.stripeCustomerId) return user.stripeCustomerId

        const customer = await this.stripe.customers.create({
            email,
            name: name || undefined,
            metadata: { userId },
        })
        await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id } })
        return customer.id
    }

    async createCheckoutSession(params: CheckoutParams): Promise<{ url: string } | { error: string }> {
        const { priceId, customerId, userId, planId, trialPeriodDays, successUrl, cancelUrl } = params

        const checkoutSession = await this.stripe.checkout.sessions.create({
            customer: customerId!,
            mode: 'subscription',
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId, planId },
            subscription_data: {
                metadata: { userId, planId },
                trial_period_days: trialPeriodDays && trialPeriodDays > 0 ? trialPeriodDays : undefined,
            },
            allow_promotion_codes: true,
        })

        if (!checkoutSession.url) return { error: 'Impossible de créer la session de paiement' }
        return { url: checkoutSession.url }
    }

    async createCustomerPortal({ customerId, returnUrl }: CustomerPortalParams): Promise<{ url: string } | { error: string }> {
        const portalSession = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        })
        return { url: portalSession.url }
    }

    async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; currentPeriodEnd?: string | null; error?: string }> {
        await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })

        const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
            select: { currentPeriodEnd: true }
        })

        return {
            success: true,
            currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
        }
    }

    async syncPlans(): Promise<{ success: boolean; error?: string }> {
        try {
            const products = await this.stripe.products.list({ active: true })

            for (const product of products.data) {
                await this._syncPlanFromProduct(product)
            }

            return { success: true }
        } catch (error: any) {
            console.error('[STRIPE] syncPlans error:', error)
            return { success: false, error: 'Failed to sync plans from Stripe' }
        }
    }

    private async _syncPlanFromProduct(product: Stripe.Product) {
        let features: Record<string, any>
        try {
            features = product.metadata.features
                ? JSON.parse(product.metadata.features)
                : { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
        } catch {
            features = { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
        }

        const slug = product.metadata.slug || product.name.toLowerCase().replace(/\s+/g, '-')
        const prices = await this.stripe.prices.list({ product: product.id, active: true })
        const monthlyPrice = prices.data.find(p => p.recurring?.interval === 'month')
        const yearlyPrice = prices.data.find(p => p.recurring?.interval === 'year')

        const planData: any = {
            name: product.name,
            slug,
            features,
            isActive: product.active,
            stripeProductId: product.id,
            sortOrder: parseInt(product.metadata.sortOrder || '0'),
            monthlyPrice: monthlyPrice?.unit_amount ?? 0,
            yearlyPrice: yearlyPrice?.unit_amount ?? 0,
            stripeMonthlyPriceId: monthlyPrice?.id ?? null,
            stripeYearlyPriceId: yearlyPrice?.id ?? null,
            trialPeriodDays: monthlyPrice?.recurring?.trial_period_days ?? 0,
        }

        const existing = await prisma.plan.findFirst({ where: { stripeProductId: product.id } })
        if (existing) {
            await prisma.plan.update({ where: { id: existing.id }, data: planData })
        } else {
            await prisma.plan.create({ data: planData })
        }
    }

    async getPromotions(): Promise<PromoResult[]> {
        const stripePromos = await this.stripe.promotionCodes.list({
            active: true,
            limit: 100,
            expand: ['data.coupon']
        })

        return stripePromos.data.map(promo => {
            const coupon = (promo as any).coupon as Stripe.Coupon
            return {
                id: promo.id,
                code: promo.code,
                discountType: coupon.percent_off ? 'percentage' : 'fixed',
                discountValue: coupon.percent_off ? coupon.percent_off : (coupon.amount_off ?? 0),
                maxUses: promo.max_redemptions || coupon.max_redemptions || null,
                usedCount: promo.times_redeemed,
                expiresAt: promo.expires_at
                    ? new Date(promo.expires_at * 1000)
                    : (coupon.redeem_by ? new Date(coupon.redeem_by * 1000) : null),
                isActive: promo.active,
                plan: null,
            }
        })
    }

    async createPromotion(data: PromoCreateData): Promise<{ success: boolean; error?: string }> {
        const couponData: Stripe.CouponCreateParams = {
            name: `Promo: ${data.code}`,
            duration: 'forever',
        }

        if (data.discountType === 'percentage') {
            couponData.percent_off = data.discountValue
        } else {
            couponData.amount_off = data.discountValue
            couponData.currency = 'eur'
        }

        if (data.maxUses) couponData.max_redemptions = data.maxUses
        if (data.expiresAt) couponData.redeem_by = Math.floor(data.expiresAt.getTime() / 1000)

        const coupon = await this.stripe.coupons.create(couponData)
        await this.stripe.promotionCodes.create({
            coupon: coupon.id,
            code: data.code,
            active: true,
            max_redemptions: data.maxUses ?? undefined,
            expires_at: data.expiresAt ? Math.floor(data.expiresAt.getTime() / 1000) : undefined,
        } as any)

        return { success: true }
    }

    async deletePromotion(promoCodeId: string): Promise<{ success: boolean; error?: string }> {
        await this.stripe.promotionCodes.update(promoCodeId, { active: false })
        return { success: true }
    }

    async refundSubscription(sub: RefundSubParams): Promise<{ success: boolean; error?: string }> {
        const subscriptionId = sub.stripeSubscriptionId
        if (!subscriptionId) return { success: false, error: "Pas d'identifiant Stripe trouvé" }

        const invoices = await this.stripe.invoices.list({ subscription: subscriptionId, limit: 1 })
        if (invoices.data.length === 0) return { success: false, error: 'Aucune facture trouvée' }

        const paymentIntentId = (invoices.data[0] as any).payment_intent
        if (!paymentIntentId) return { success: false, error: 'Aucun paiement trouvé' }

        try {
            await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })
            await this.stripe.subscriptions.cancel(subscriptionId)
        } catch (e: any) {
            console.error('[STRIPE] cancel error during refund:', e)
        }

        try {
            await this.stripe.refunds.create({ payment_intent: paymentIntentId as string })
        } catch (e: any) {
            if (!e.message?.includes('already been refunded')) throw e
        }

        return { success: true }
    }

    async calculateMRR(): Promise<number> {
        try {
            let totalCents = 0

            for await (const sub of this.stripe.subscriptions.list({
                status: 'active',
                expand: ['data.discount', 'data.discount.coupon']
            }) as any) {
                const item = sub.items.data[0]
                if (!item?.price) continue

                const unitAmount = item.price.unit_amount || 0
                const interval = item.price.recurring?.interval || 'month'
                const quantity = item.quantity || 1

                let monthlyBase = interval === 'year'
                    ? (unitAmount * quantity) / 12
                    : (unitAmount * quantity)

                const discount = (sub as any).discount
                if (discount?.coupon) {
                    const coupon = discount.coupon as Stripe.Coupon
                    if (coupon.percent_off) {
                        monthlyBase *= (1 - coupon.percent_off / 100)
                    } else if (coupon.amount_off) {
                        const discountValue = interval === 'year' ? coupon.amount_off / 12 : coupon.amount_off
                        monthlyBase = Math.max(0, monthlyBase - discountValue)
                    }
                }

                totalCents += monthlyBase
            }

            return Math.round(totalCents)
        } catch (error) {
            console.error('[STRIPE] calculateMRR error:', error)
            return 0
        }
    }
}
