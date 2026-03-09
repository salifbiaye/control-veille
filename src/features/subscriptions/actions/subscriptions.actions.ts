'use server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { getPaymentProvider } from '@/lib/payment'
import { revalidatePath } from 'next/cache'

export type SubscriptionDetails = {
    id: string
    userId: string
    planId: string
    status: string
    cancelAtPeriodEnd: boolean
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
        await requirePermission('VIEW_ANALYTICS')
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
            cancelAtPeriodEnd: s.cancelAtPeriodEnd ?? false,
            createdAt: s.createdAt,
            currentPeriodEnd: s.currentPeriodEnd,
            planName: s.plan.name,
            planPrice: (typeof s.pricePaid === 'number' && s.plan.yearlyPrice > 0 && s.pricePaid >= s.plan.yearlyPrice) ? s.plan.yearlyPrice : s.plan.monthlyPrice,
            interval: (typeof s.pricePaid === 'number' && s.plan.yearlyPrice > 0 && s.pricePaid >= s.plan.yearlyPrice) ? 'year' : 'month',
            userName: s.user.name || '-',
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
        await requirePermission('EDIT_USERS')

        const sub = await prisma.subscription.findUnique({
            where: { id: subscriptionId }
        })

        if (!sub?.stripeSubscriptionId && !sub?.paddleSubscriptionId) {
            return { success: false, error: "Pas d'identifiant de paiement trouve pour cet abonnement" }
        }

        const result = await getPaymentProvider().refundSubscription({
            stripeSubscriptionId: sub.stripeSubscriptionId,
            paddleSubscriptionId: sub.paddleSubscriptionId,
        })

        if (!result.success) return result

        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'refunded',
                cancelAtPeriodEnd: false,   // accès révoqué immédiatement
                currentPeriodEnd: new Date(), // accès terminé maintenant
            }
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
