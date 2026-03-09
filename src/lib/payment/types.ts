// ─────────────────────────────────────────────────────────────
// Payment Provider — Types partagés
// ─────────────────────────────────────────────────────────────

export interface CheckoutParams {
    userId: string
    planId: string
    interval: 'month' | 'year'
    userEmail: string
    userName?: string | null
    customerId: string | null           // stripeCustomerId ou paddleCustomerId selon provider
    priceId: string                     // stripeMonthlyPriceId/Yearly ou paddlePriceIdMonthly/Yearly
    trialPeriodDays?: number | null
    successUrl: string
    cancelUrl: string
}

export interface CustomerPortalParams {
    customerId: string      // stripeCustomerId ou paddleCustomerId
    returnUrl: string
}

export interface PromoResult {
    id: string
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    maxUses: number | null
    usedCount: number
    expiresAt: Date | null
    isActive: boolean
    plan: null
}

export interface PromoCreateData {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    maxUses?: number | null
    expiresAt?: Date | null
}

export interface RefundSubParams {
    stripeSubscriptionId?: string | null
    paddleSubscriptionId?: string | null
}

// ─────────────────────────────────────────────────────────────
// Interface principale — tous les providers doivent l'implémenter
// ─────────────────────────────────────────────────────────────

export interface PaymentProvider {
    // Checkout
    createCheckoutSession(params: CheckoutParams): Promise<{ url: string } | { error: string }>
    createCustomerPortal(params: CustomerPortalParams): Promise<{ url: string } | { error: string }>
    cancelSubscription(subscriptionId: string): Promise<{ success: boolean; currentPeriodEnd?: string | null; error?: string }>

    // Plans sync
    syncPlans(): Promise<{ success: boolean; error?: string }>

    // Promotions (admin)
    getPromotions(): Promise<PromoResult[]>
    createPromotion(data: PromoCreateData): Promise<{ success: boolean; error?: string }>
    deletePromotion(promoId: string): Promise<{ success: boolean; error?: string }>

    // Subscriptions admin
    refundSubscription(sub: RefundSubParams): Promise<{ success: boolean; error?: string }>

    // Analytics
    calculateMRR(): Promise<number>

    // Customer
    createOrGetCustomer(params: { userId: string; email: string; name?: string | null }): Promise<string>
}
