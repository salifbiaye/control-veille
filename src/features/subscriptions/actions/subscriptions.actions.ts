'use server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'

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
                    user: { select: { name: true, email: true } },
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
            userEmail: s.user.email
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
