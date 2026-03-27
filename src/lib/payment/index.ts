// ─────────────────────────────────────────────────────────────
// Payment Factory — retourne le provider selon PAYMENT_PROVIDER
// Switcher : PAYMENT_PROVIDER=stripe | paddle (défaut: stripe)
// ─────────────────────────────────────────────────────────────

import type { PaymentProvider } from './types'
import { StripeProvider } from './stripe.provider'
import { PaddleProvider } from './paddle.provider'
import { LemonSqueezyProvider } from './lemonsqueezy.provider'

let _provider: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
    if (_provider) return _provider

    const name = process.env.PAYMENT_PROVIDER ?? 'stripe'

    if (name === 'paddle') {
        _provider = new PaddleProvider()
    } else if (name === 'lemonsqueezy') {
        _provider = new LemonSqueezyProvider()
    } else {
        _provider = new StripeProvider()
    }

    return _provider!
}

export type { PaymentProvider, CheckoutParams, PromoResult, PromoCreateData, RefundSubParams } from './types'
