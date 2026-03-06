'use server'

import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'

async function syncPlanFromStripe(product: Stripe.Product) {
    let features: Record<string, any>
    try {
        features = product.metadata.features
            ? JSON.parse(product.metadata.features)
            : { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
    } catch {
        features = { techWatches: 3, notes: 50, storage: 536870912, companion: false, courses: false, interviews: false, aiTools: false }
    }

    const slug = product.metadata.slug || product.name.toLowerCase().replace(/\s+/g, '-')

    // Fetch all prices for this product
    const prices = await stripe.prices.list({ product: product.id, active: true })

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
    }

    const existing = await prisma.plan.findFirst({ where: { stripeProductId: product.id } })
    if (existing) {
        await prisma.plan.update({ where: { id: existing.id }, data: planData })
    } else {
        await prisma.plan.create({ data: planData })
    }
}

export async function syncAllPlansFromStripe() {
    try {
        await requirePermission('EDIT_PLANS')

        const products = await stripe.products.list({ active: true })

        for (const product of products.data) {
            await syncPlanFromStripe(product)
        }

        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error) {
        console.error('[SYNC_ACTION] Error syncing plans from Stripe:', error)
        return { success: false, error: 'Failed to sync plans' }
    }
}
