'use server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

export type SubscriptionDetails = {
    id: string
    userId: string
    planId: string
    status: string
    createdAt: Date
    currentPeriodEnd: Date | null
    planName: string
    planPrice: number
    interval: string
    userName: string
    userEmail: string
    stripeSubscriptionId: string | null
    stripeCustomerId: string | null
}

export type PaginatedResult<T> = {
    data: T[]
    meta: { page: number; limit: number; total: number; totalPages: number }
}

export async function getSubscriptions(page = 1, limit = 20): Promise<PaginatedResult<SubscriptionDetails>> {
    try {
        await requirePermission('VIEW_ANALYTICS') // Or 'VIEW_USERS', up to authorization matrix
        const skip = (page - 1) * limit

        const [subs, total] = await Promise.all([
            prisma.subscription.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true, stripeCustomerId: true } },
                    plan: { select: { name: true, price: true, interval: true } }
                }
            }),
            prisma.subscription.count()
        ])

        const data: SubscriptionDetails[] = subs.map(s => ({
            id: s.id,
            userId: s.userId,
            planId: s.planId,
            status: s.status,
            createdAt: s.createdAt,
            currentPeriodEnd: s.currentPeriodEnd,
            planName: s.plan.name,
            planPrice: s.plan.price,
            interval: s.plan.interval,
            userName: s.user.name || '—',
            userEmail: s.user.email,
            stripeSubscriptionId: s.stripeSubscriptionId,
            stripeCustomerId: s.user.stripeCustomerId
        }))

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        console.error('[SUBSCRIPTIONS] Error fetching:', error)
        return { data: [], meta: { page: 1, limit, total: 0, totalPages: 0 } }
    }
}
export async function refundSubscription(subscriptionId: string) {
    try {
        await requirePermission('EDIT_USERS') // Or dedicated permission

        const sub = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            select: { stripeSubscriptionId: true }
        })

        if (!sub?.stripeSubscriptionId) {
            return { success: false, error: "Pas d'identifiant Stripe trouvé pour cet abonnement" }
        }

        // 1. Get the latest invoice for this subscription
        const invoices = await stripe.invoices.list({
            subscription: sub.stripeSubscriptionId,
            limit: 1
        })

        if (invoices.data.length === 0) {
            return { success: false, error: "Aucune facture trouvée pour cet abonnement" }
        }

        const latestInvoice = invoices.data[0]
        const paymentIntentId = (latestInvoice as any).payment_intent

        if (!paymentIntentId) {
            return { success: false, error: "Aucun paiement trouvé pour cette facture" }
        }

        // 2. Refund the payment intent
        await stripe.refunds.create({
            payment_intent: paymentIntentId as string,
        })

        // 3. Mark as refunded (optional: maybe update status or logic in DB)
        // We might want to cancel the subscription too ?
        await stripe.subscriptions.cancel((sub as any).stripeSubscriptionId)

        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'refunded' }
        })

        revalidatePath('/dashboard/users')
        revalidatePath('/dashboard/subscriptions')
        revalidatePath('/dashboard/pricing')

        return { success: true }
    } catch (error: any) {
        console.error('[REFUND] Error:', error)
        return { success: false, error: error.message || 'Erreur lors du remboursement' }
    }
}
