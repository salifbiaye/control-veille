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
                    plan: { select: { name: true, monthlyPrice: true, yearlyPrice: true } }
                }
            } as any),
            prisma.subscription.count()
        ])

        const data: SubscriptionDetails[] = (subs as any[]).map(s => ({
            id: s.id,
            userId: s.userId,
            planId: s.planId,
            status: s.status,
            createdAt: s.createdAt,
            currentPeriodEnd: s.currentPeriodEnd,
            planName: s.plan.name,
            planPrice: (typeof s.pricePaid === 'number' && s.plan.yearlyPrice > 0 && s.pricePaid >= s.plan.yearlyPrice) ? s.plan.yearlyPrice : s.plan.monthlyPrice,
            interval: (typeof s.pricePaid === 'number' && s.plan.yearlyPrice > 0 && s.pricePaid >= s.plan.yearlyPrice) ? 'year' : 'month',
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

        const sub = await (prisma.subscription.findUnique as any)({
            where: { id: subscriptionId }
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

        // 2. Annuler l'abonnement Stripe en premier
        try {
            await stripe.subscriptions.update((sub as any).stripeSubscriptionId, {
                cancel_at_period_end: false,
            })
            await stripe.subscriptions.cancel((sub as any).stripeSubscriptionId)
        } catch (cancelError: any) {
            console.error('[REFUND] Erreur lors de l’annulation de l’abonnement Stripe:', cancelError)
            // On continue pour essayer de rembourser même si l'annulation échoue (ex: déjà annulé)
        }

        // 3. Rembourser le payment intent
        try {
            await stripe.refunds.create({
                payment_intent: paymentIntentId as string,
            })
        } catch (refundError: any) {
            console.error('[REFUND] Erreur lors du remboursement:', refundError)
            // Si c'est déjà remboursé, on continue pour mettre à jour la BDD
            if (refundError.type !== 'StripeInvalidRequestError' || !refundError.message.includes('already been refunded')) {
                throw refundError // Remonter les autres erreurs
            }
        }

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
