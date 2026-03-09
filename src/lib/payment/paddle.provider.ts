// ─────────────────────────────────────────────────────────────
// Paddle Provider — implémentation PaymentProvider via Paddle (MoR)
// Sandbox : PADDLE_ENVIRONMENT=sandbox + clé sandbox Paddle
// ─────────────────────────────────────────────────────────────

import { Paddle, Environment } from '@paddle/paddle-node-sdk'
import { prisma } from '@/lib/prisma'
import type { PaymentProvider, CheckoutParams, CustomerPortalParams, PromoResult, PromoCreateData, RefundSubParams } from './types'

function getPaddle(): Paddle {
    if (!process.env.PADDLE_API_KEY) {
        throw new Error('PADDLE_API_KEY is not defined')
    }
    return new Paddle(process.env.PADDLE_API_KEY, {
        environment: process.env.PADDLE_ENVIRONMENT === 'sandbox'
            ? Environment.sandbox
            : Environment.production,
    })
}

export class PaddleProvider implements PaymentProvider {
    private get paddle() {
        return getPaddle()
    }

    async createOrGetCustomer({ userId, email, name }: { userId: string; email: string; name?: string | null }): Promise<string> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { paddleCustomerId: true } })
        if (user?.paddleCustomerId) return user.paddleCustomerId

        const customer = await this.paddle.customers.create({
            email,
            name: name || undefined,
            customData: { userId } as any,
        })

        await prisma.user.update({
            where: { id: userId },
            data: { paddleCustomerId: customer.id },
        })

        return customer.id
    }

    async createCheckoutSession(params: CheckoutParams): Promise<{ url: string } | { error: string }> {
        const { priceId, customerId, userId, planId, trialPeriodDays, successUrl } = params

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const transactionData: any = {
            items: [{ priceId, quantity: 1 }],
            customerId,
            customData: { userId, planId },
            checkout: {
                url: `${baseUrl}/pricing`,  // page avec Paddle.js → overlay s'ouvre ici
                returnUrl: successUrl,       // redirect après paiement
            },
        }

        if (trialPeriodDays && trialPeriodDays > 0) {
            transactionData.items[0].trialDays = trialPeriodDays
        }

        const transaction = await this.paddle.transactions.create(transactionData)
        const checkoutUrl = (transaction as any).checkout?.url
        if (!checkoutUrl) return { error: 'Impossible de créer la session Paddle' }

        return { url: checkoutUrl }
    }

    async createCustomerPortal({ customerId, returnUrl }: CustomerPortalParams): Promise<{ url: string } | { error: string }> {
        const session = await (this.paddle.customers as any).generateAuthToken(customerId)
        const baseUrl = process.env.PADDLE_ENVIRONMENT === 'sandbox'
            ? 'https://sandbox-buyer-portal.paddle.com'
            : 'https://buyer-portal.paddle.com'

        const url = `${baseUrl}/overview?token=${session.token}&returnUrl=${encodeURIComponent(returnUrl)}`
        return { url }
    }

    async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; currentPeriodEnd?: string | null; error?: string }> {
        const subscription = await this.paddle.subscriptions.cancel(subscriptionId, {
            effectiveFrom: 'next_billing_period',
        })

        const periodEnd = (subscription as any).currentBillingPeriod?.endsAt ?? null

        await prisma.subscription.update({
            where: { paddleSubscriptionId: subscriptionId },
            data: { cancelAtPeriodEnd: true },
        }).catch(() => null)

        return { success: true, currentPeriodEnd: periodEnd }
    }

    async syncPlans(): Promise<{ success: boolean; error?: string }> {
        try {
            for await (const product of this.paddle.products.list({ status: ['active'] }) as any) {
                await this._syncPlanFromProduct(product)
            }
            return { success: true }
        } catch (error: any) {
            console.error('[PADDLE] syncPlans error:', error)
            return { success: false, error: 'Failed to sync plans from Paddle' }
        }
    }

    private async _syncPlanFromProduct(product: any) {
        let features: Record<string, any>
        try {
            features = product.customData?.features
                ? JSON.parse(product.customData.features)
                : { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
        } catch {
            features = { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
        }

        const slug = product.customData?.slug || product.name.toLowerCase().replace(/\s+/g, '-')
        const prices: any[] = []

        for await (const price of this.paddle.prices.list({ productId: [product.id], status: ['active'] }) as any) {
            prices.push(price)
        }

        const monthlyPrice = prices.find((p: any) => p.billingCycle?.interval === 'month')
        const yearlyPrice = prices.find((p: any) => p.billingCycle?.interval === 'year')

        // Extraction des périodes d'essai par cycle
        let trialMonthly = 0
        let trialYearly = 0

        if (monthlyPrice?.trialPeriod) {
            const { frequency, interval } = monthlyPrice.trialPeriod
            if (interval === 'day') trialMonthly = frequency
            else if (interval === 'week') trialMonthly = frequency * 7
            else if (interval === 'month') trialMonthly = frequency * 30
        }

        if (yearlyPrice?.trialPeriod) {
            const { frequency, interval } = yearlyPrice.trialPeriod
            if (interval === 'day') trialYearly = frequency
            else if (interval === 'week') trialYearly = frequency * 7
            else if (interval === 'month') trialYearly = frequency * 30
        }

        const planData: any = {
            name: product.name,
            slug,
            features,
            isActive: product.status === 'active',
            paddleProductId: product.id,
            sortOrder: parseInt(product.customData?.sortOrder || '0'),
            monthlyPrice: monthlyPrice ? parseInt(monthlyPrice.unitPrice?.amount || '0') : 0,
            yearlyPrice: yearlyPrice ? parseInt(yearlyPrice.unitPrice?.amount || '0') : 0,
            paddlePriceIdMonthly: monthlyPrice?.id ?? null,
            paddlePriceIdYearly: yearlyPrice?.id ?? null,
            trialPeriodDays: Math.max(trialMonthly, trialYearly), // Fallback
            trialPeriodDaysMonthly: trialMonthly,
            trialPeriodDaysYearly: trialYearly,
        }

        const existing = await prisma.plan.findFirst({
            where: {
                OR: [
                    { paddleProductId: product.id },
                    { slug: slug },
                    { name: product.name }
                ]
            }
        })
        if (existing) {
            await prisma.plan.update({ where: { id: existing.id }, data: planData })
        } else {
            await prisma.plan.create({ data: planData })
        }
    }

    async getPromotions(): Promise<PromoResult[]> {
        const results: PromoResult[] = []

        for await (const d of this.paddle.discounts.list({ status: ['active'] }) as any) {
            results.push({
                id: d.id,
                code: d.code || d.id,
                discountType: d.type === 'percentage' ? 'percentage' : 'fixed',
                discountValue: d.type === 'percentage' ? parseFloat(d.amount) : parseInt(d.amount),
                maxUses: d.maximumRecurringIntervals ?? null,
                usedCount: d.timesUsed ?? 0,
                expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
                isActive: d.status === 'active',
                plan: null,
            })
        }

        return results
    }

    async createPromotion(data: PromoCreateData): Promise<{ success: boolean; error?: string }> {
        await this.paddle.discounts.create({
            amount: String(data.discountValue),
            description: `Promo: ${data.code}`,
            type: data.discountType === 'percentage' ? 'percentage' : 'flat',
            code: data.code,
            enabledForCheckout: true,
            recur: true,
            maximumRecurringIntervals: data.maxUses ?? undefined,
            expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
        } as any)

        return { success: true }
    }

    async deletePromotion(discountId: string): Promise<{ success: boolean; error?: string }> {
        await this.paddle.discounts.update(discountId, { status: 'archived' } as any)
        return { success: true }
    }

    async refundSubscription(sub: RefundSubParams): Promise<{ success: boolean; error?: string }> {
        const subscriptionId = sub.paddleSubscriptionId
        if (!subscriptionId) return { success: false, error: "Pas d'identifiant Paddle trouvé" }

        // 1. Annulation immédiate (client mécontent → perte d'accès instantanée)
        await this.paddle.subscriptions.cancel(subscriptionId, {
            effectiveFrom: 'immediately',
        }).catch(e => console.error('[PADDLE] cancel error:', e))

        // 2. Rembourser la dernière transaction payée (skip si trial → 0€)
        let refunded = false
        for await (const tx of this.paddle.transactions.list({
            subscriptionId: [subscriptionId],
            status: ['completed'],
        }) as any) {
            const totalAmount = parseFloat(tx.details?.totals?.total ?? tx.details?.totals?.grand_total ?? '0')
            if (totalAmount > 0) {
                await (this.paddle.transactions as any)
                    .refund(tx.id, { reason: 'other' })
                    .catch((e: any) => console.error('[PADDLE] refund error:', e))
                refunded = true
            } else {
                console.log('[PADDLE] Transaction was trial (0€) — no refund issued, only cancelled.')
            }
            break // Seulement la plus récente
        }

        console.log(`[PADDLE] refundSubscription complete — cancelled: true, refunded: ${refunded}`)
        return { success: true }
    }

    async calculateMRR(): Promise<number> {
        try {
            let totalCents = 0

            for await (const sub of this.paddle.subscriptions.list({ status: ['active'] }) as any) {
                const item = sub.items?.[0]
                if (!item?.price) continue

                const unitAmount = parseInt(item.price.unitPrice?.amount || '0')
                const interval = item.price.billingCycle?.interval || 'month'
                const quantity = item.quantity || 1

                const monthlyBase = interval === 'year'
                    ? (unitAmount * quantity) / 12
                    : (unitAmount * quantity)

                totalCents += monthlyBase
            }

            return Math.round(totalCents)
        } catch (error) {
            console.error('[PADDLE] calculateMRR error:', error)
            return 0
        }
    }
}
