// ─────────────────────────────────────────────────────────────
// LemonSqueezy Provider — implémentation PaymentProvider via Lemon Squeezy (MoR)
// Test mode : store en mode test par défaut sur LS
// ─────────────────────────────────────────────────────────────

import {
    lemonSqueezySetup,
    createCheckout,
    createCustomer,
    listCustomers,
    getCustomer,
    listProducts,
    listVariants,
    listSubscriptions,
    cancelSubscription as lsCancelSubscription,
    updateSubscription,
    listDiscounts,
    createDiscount,
    deleteDiscount,
    listSubscriptionInvoices,
    issueSubscriptionInvoiceRefund,
} from '@lemonsqueezy/lemonsqueezy.js'
import { prisma } from '@/lib/prisma'
import type {
    PaymentProvider,
    CheckoutParams,
    CustomerPortalParams,
    PromoResult,
    PromoCreateData,
    RefundSubParams,
} from './types'

function setupLemon() {
    if (!process.env.LEMON_API_KEY) {
        throw new Error('LEMON_API_KEY is not defined')
    }
    lemonSqueezySetup({ apiKey: process.env.LEMON_API_KEY })
}

function getStoreId(): string {
    if (!process.env.LEMON_STORE_ID) {
        throw new Error('LEMON_STORE_ID is not defined')
    }
    return process.env.LEMON_STORE_ID
}

export class LemonSqueezyProvider implements PaymentProvider {
    constructor() {
        setupLemon()
    }

    async createOrGetCustomer({ userId, email, name }: { userId: string; email: string; name?: string | null }): Promise<string> {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { lemonCustomerId: true } })
        if (user?.lemonCustomerId) return user.lemonCustomerId

        // Chercher un customer existant par email
        const existing = await listCustomers({ filter: { storeId: getStoreId(), email } })
        if (existing.data?.data?.length) {
            const customerId = String(existing.data.data[0].id)
            await prisma.user.update({
                where: { id: userId },
                data: { lemonCustomerId: customerId },
            })
            return customerId
        }

        // Créer un nouveau customer
        const customer = await createCustomer(getStoreId(), {
            name: name || email,
            email,
        })

        const customerId = String(customer.data!.data.id)
        await prisma.user.update({
            where: { id: userId },
            data: { lemonCustomerId: customerId },
        })

        return customerId
    }

    async createCheckoutSession(params: CheckoutParams): Promise<{ url: string } | { error: string }> {
        const { priceId, userId, planId, userEmail, userName, successUrl } = params

        try {
            const checkout = await createCheckout(getStoreId(), priceId, {
                checkoutData: {
                    email: userEmail,
                    name: userName || undefined,
                    custom: { userId, planId },
                },
                checkoutOptions: {
                    embed: true,
                },
                productOptions: {
                    redirectUrl: successUrl,
                    enabledVariants: [Number(priceId)],
                },
            })

            const url = checkout.data?.data.attributes.url
            if (!url) return { error: 'Impossible de créer le checkout LemonSqueezy' }

            return { url }
        } catch (error: any) {
            console.error('[LEMON] createCheckoutSession error:', error)
            return { error: error.message || 'Erreur checkout LemonSqueezy' }
        }
    }

    async createCustomerPortal({ customerId }: CustomerPortalParams): Promise<{ url: string } | { error: string }> {
        try {
            // Trouver une subscription active pour obtenir le customer_portal URL
            const subs = await listSubscriptions({
                filter: { storeId: getStoreId() },
            })

            // Chercher une sub qui correspond au customer
            const customerSub = subs.data?.data?.find(
                (s: any) => String(s.attributes.customer_id) === customerId
            )

            if (customerSub) {
                const portalUrl = (customerSub as any).attributes.urls?.customer_portal
                if (portalUrl) return { url: portalUrl }
            }

            // Fallback: récupérer depuis le customer object
            const customer = await getCustomer(customerId)
            const portalUrl = customer.data?.data.attributes.urls?.customer_portal
            if (portalUrl) return { url: portalUrl }

            return { error: 'Aucun portail client disponible' }
        } catch (error: any) {
            console.error('[LEMON] createCustomerPortal error:', error)
            return { error: error.message || 'Impossible d\'accéder au portail client LemonSqueezy' }
        }
    }

    async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; currentPeriodEnd?: string | null; error?: string }> {
        try {
            const sub = await lsCancelSubscription(subscriptionId)
            const endsAt = (sub.data?.data.attributes as any)?.ends_at ?? null

            await prisma.subscription.update({
                where: { lemonSubscriptionId: subscriptionId },
                data: { cancelAtPeriodEnd: true },
            }).catch(() => null)

            return { success: true, currentPeriodEnd: endsAt }
        } catch (error: any) {
            console.error('[LEMON] cancelSubscription error:', error)
            return { success: false, error: error.message || 'Impossible d\'annuler l\'abonnement' }
        }
    }

    async syncPlans(): Promise<{ success: boolean; error?: string }> {
        try {
            const products = await listProducts({ filter: { storeId: getStoreId() } })
            if (!products.data?.data) return { success: false, error: 'No products found' }

            for (const product of products.data.data) {
                await this._syncPlanFromProduct(product)
            }

            return { success: true }
        } catch (error: any) {
            console.error('[LEMON] syncPlans error:', error)
            return { success: false, error: 'Failed to sync plans from LemonSqueezy' }
        }
    }

    private async _syncPlanFromProduct(product: any) {
        const attrs = product.attributes
        const productId = String(product.id)

        // Récupérer les variants de ce produit
        const variants = await listVariants({ filter: { productId } })
        const variantList = variants.data?.data || []

        // Trouver monthly/yearly par intervalle
        const monthlyVariant = variantList.find(
            (v: any) => v.attributes.interval === 'month' && v.attributes.status === 'published'
        )
        const yearlyVariant = variantList.find(
            (v: any) => v.attributes.interval === 'year' && v.attributes.status === 'published'
        )

        // Extraire features depuis la description ou metadata
        let features: Record<string, any>
        try {
            features = attrs.description
                ? JSON.parse(attrs.description)
                : { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
        } catch {
            features = { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
        }

        const slug = attrs.slug || attrs.name.toLowerCase().replace(/\s+/g, '-')

        // Trial period: LS utilise trial_period_days sur le variant
        const trialMonthly = monthlyVariant?.attributes?.trial_interval_count ?? 0
        const trialYearly = yearlyVariant?.attributes?.trial_interval_count ?? 0

        const planData: any = {
            name: attrs.name,
            slug,
            features,
            isActive: attrs.status === 'published',
            lemonProductId: productId,
            sortOrder: attrs.sort ?? 0,
            monthlyPrice: monthlyVariant ? monthlyVariant.attributes.price : 0,
            yearlyPrice: yearlyVariant ? yearlyVariant.attributes.price : 0,
            lemonVariantIdMonthly: monthlyVariant ? String(monthlyVariant.id) : null,
            lemonVariantIdYearly: yearlyVariant ? String(yearlyVariant.id) : null,
            trialPeriodDays: Math.max(trialMonthly, trialYearly),
            trialPeriodDaysMonthly: trialMonthly,
            trialPeriodDaysYearly: trialYearly,
        }

        const existing = await prisma.plan.findFirst({
            where: {
                OR: [
                    { lemonProductId: productId },
                    { slug },
                    { name: attrs.name },
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
        const discounts = await listDiscounts({ filter: { storeId: getStoreId() } })
        if (!discounts.data?.data) return []

        return discounts.data.data.map((d: any) => ({
            id: String(d.id),
            code: d.attributes.code || String(d.id),
            discountType: d.attributes.amount_type === 'percent' ? 'percentage' as const : 'fixed' as const,
            discountValue: d.attributes.amount,
            maxUses: d.attributes.is_limited_redemptions ? d.attributes.max_redemptions : null,
            usedCount: d.attributes.redemptions_count ?? 0,
            expiresAt: d.attributes.expires_at ? new Date(d.attributes.expires_at) : null,
            isActive: d.attributes.status === 'published',
            plan: null,
        }))
    }

    async createPromotion(data: PromoCreateData): Promise<{ success: boolean; error?: string }> {
        try {
            await createDiscount({
                storeId: getStoreId(),
                name: `Promo: ${data.code}`,
                code: data.code,
                amount: data.discountValue,
                amountType: data.discountType === 'percentage' ? 'percent' : 'fixed',
                isLimitedRedemptions: !!data.maxUses,
                maxRedemptions: data.maxUses ?? undefined,
                expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
            })

            return { success: true }
        } catch (error: any) {
            console.error('[LEMON] createPromotion error:', error)
            return { success: false, error: error.message }
        }
    }

    async deletePromotion(discountId: string): Promise<{ success: boolean; error?: string }> {
        try {
            await deleteDiscount(discountId)
            return { success: true }
        } catch (error: any) {
            console.error('[LEMON] deletePromotion error:', error)
            return { success: false, error: error.message }
        }
    }

    async refundSubscription(sub: RefundSubParams): Promise<{ success: boolean; error?: string }> {
        const subscriptionId = sub.lemonSubscriptionId
        if (!subscriptionId) return { success: false, error: "Pas d'identifiant LemonSqueezy trouvé" }

        try {
            // Annuler immédiatement
            await lsCancelSubscription(subscriptionId).catch(e =>
                console.error('[LEMON] cancel error:', e)
            )

            // Rembourser la dernière invoice
            const invoices = await listSubscriptionInvoices({
                filter: { subscriptionId: Number(subscriptionId) },
            })

            const lastInvoice = invoices.data?.data?.[0]
            if (lastInvoice) {
                const total = (lastInvoice.attributes as any)?.total ?? 0
                await issueSubscriptionInvoiceRefund(String(lastInvoice.id), total)
                    .catch((e: any) => console.error('[LEMON] refund error:', e))
            }

            return { success: true }
        } catch (error: any) {
            console.error('[LEMON] refundSubscription error:', error)
            return { success: false, error: error.message }
        }
    }

    async changePlan(subscriptionId: string, newPriceId: string, isUpgrade: boolean): Promise<{ success: boolean; scheduledAt?: string | null; error?: string }> {
        try {
            const updated = await updateSubscription(subscriptionId, {
                variantId: Number(newPriceId),
            })

            return { success: true, scheduledAt: null }
        } catch (error: any) {
            console.error('[LEMON] changePlan error:', error)
            return { success: false, error: error.message || 'Impossible de changer de plan' }
        }
    }

    async calculateMRR(): Promise<number> {
        try {
            let totalCents = 0

            const subs = await listSubscriptions({
                filter: { storeId: getStoreId(), status: 'active' },
            })

            for (const sub of subs.data?.data || []) {
                const attrs = sub.attributes as any
                const price = attrs.first_subscription_item?.price?.unit_price ?? 0
                const interval = attrs.variant_name?.toLowerCase().includes('year') ? 'year' : 'month'
                const quantity = attrs.first_subscription_item?.quantity ?? 1

                const monthlyBase = interval === 'year'
                    ? (price * quantity) / 12
                    : (price * quantity)

                totalCents += monthlyBase
            }

            return Math.round(totalCents)
        } catch (error) {
            console.error('[LEMON] calculateMRR error:', error)
            return 0
        }
    }
}
