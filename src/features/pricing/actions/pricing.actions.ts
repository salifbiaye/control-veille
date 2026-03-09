'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/session'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PlanFeatures {
    resources: number
    isPopular?: boolean
    agenda?: boolean
    [key: string]: number | boolean | undefined
}

export type PlanData = {
    name: string
    slug: string
    monthlyPrice: number
    yearlyPrice: number
    features: PlanFeatures
    isActive: boolean
    sortOrder: number
    trialDays?: number
}

export type PromotionData = {
    code: string
    planId: string | null
    discountType: 'percentage' | 'fixed'
    discountValue: number
    maxUses: number | null
    expiresAt: Date | null
    isActive: boolean
}

// ─────────────────────────────────────────────────────────────
// Plans Actions
// ─────────────────────────────────────────────────────────────

export async function getPlans() {
    try {
        await requirePermission('VIEW_PLANS')
        const plans = await prisma.plan.findMany({
            orderBy: { sortOrder: 'asc' },
        })

        const totalUsers = await prisma.user.count({
            where: {
                role: 'USER',
                isPremiumLifetime: false
            }
        })
        const activeSubscriptionsTotal = await prisma.subscription.count({
            where: {
                status: 'active',
                user: {
                    role: 'USER',
                    isPremiumLifetime: false
                }
            }
        })

        // Manual count for active subscriptions to ensure precision
        const plansWithCounts = await Promise.all(plans.map(async (plan) => {
            let activeCount = await prisma.subscription.count({
                where: {
                    planId: plan.id,
                    status: 'active',
                    user: {
                        role: 'USER',
                        isPremiumLifetime: false
                    }
                }
            })

            // If it's a completely free manual plan, assume it acts as the default fallback
            // for users without any active subscription.
            const isFreeManualPlan = plan.monthlyPrice === 0 &&
                plan.yearlyPrice === 0 &&
                !plan.stripeMonthlyPriceId &&
                !plan.paddlePriceIdMonthly

            if (isFreeManualPlan) {
                const usersWithoutAnySubscription = totalUsers - activeSubscriptionsTotal
                // We add the users who have no subscription at all to this plan's count
                activeCount += Math.max(0, usersWithoutAnySubscription)
            }

            return {
                ...plan,
                _count: {
                    subscriptions: activeCount
                }
            }
        }))

        return { success: true, plans: plansWithCounts }
    } catch (error) {
        console.error('[PRICING] getPlans error:', error)
        return { success: false, plans: [], error: 'Erreur lors de la récupération des plans' }
    }
}

export async function createPlan(data: PlanData) {
    try {
        await requirePermission('EDIT_PLANS')
        const { monthlyPrice, yearlyPrice, features, ...rest } = data
        const plan = await prisma.plan.create({
            data: {
                ...rest,
                monthlyPrice,
                yearlyPrice,
                features: features as any,
            }
        })
        revalidatePath('/dashboard/pricing')
        return { success: true, plan }
    } catch (error) {
        console.error('[PRICING] createPlan error:', error)
        return { success: false, error: 'Erreur lors de la création du plan' }
    }
}

export async function updatePlan(id: string, data: Partial<PlanData>) {
    try {
        await requirePermission('EDIT_PLANS')
        const { monthlyPrice, yearlyPrice, features, trialDays, ...rest } = data
        const plan = await prisma.plan.update({
            where: { id },
            data: {
                ...rest,
                monthlyPrice,
                yearlyPrice,
                trialPeriodDays: trialDays,
                features: features ? (features as any) : undefined,
            }
        })
        revalidatePath('/dashboard/pricing')
        return { success: true, plan }
    } catch (error) {
        console.error('[PRICING] updatePlan error:', error)
        return { success: false, error: 'Erreur lors de la mise à jour du plan' }
    }
}

export async function deletePlan(id: string) {
    try {
        await requirePermission('DELETE_PLANS')
        await prisma.plan.delete({ where: { id } })
        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error) {
        console.error('[PRICING] deletePlan error:', error)
        return { success: false, error: 'Impossible de supprimer ce plan (des abonnements y sont liés)' }
    }
}

// ─────────────────────────────────────────────────────────────
// Promotions Actions
// ─────────────────────────────────────────────────────────────

import { getPaymentProvider } from '@/lib/payment'

export async function getPromotions() {
    try {
        await requirePermission('VIEW_PROMOTIONS')
        const promos = await getPaymentProvider().getPromotions()
        return { success: true, promos }
    } catch (error) {
        console.error('[PRICING] getPromotions error:', error)
        return { success: false, promos: [], error: 'Erreur lors de la récupération des promos' }
    }
}

export async function createPromotion(data: {
    code: string,
    discountType: 'percentage' | 'fixed',
    discountValue: number,
    maxUses?: number | null,
    expiresAt?: Date | null
}) {
    try {
        await requirePermission('EDIT_PROMOTIONS')
        const result = await getPaymentProvider().createPromotion(data)
        if (result.success) revalidatePath('/dashboard/pricing')
        return result
    } catch (error: any) {
        console.error('[PRICING] createPromotion error:', error)
        return { success: false, error: error.message || 'Erreur lors de la création de la promotion' }
    }
}

export async function deletePromotion(promoCodeId: string) {
    try {
        await requirePermission('DELETE_PROMOTIONS')
        const result = await getPaymentProvider().deletePromotion(promoCodeId)
        if (result.success) revalidatePath('/dashboard/pricing')
        return result
    } catch (error: any) {
        console.error('[PRICING] deletePromotion error:', error)
        return { success: false, error: error.message || 'Erreur lors de la désactivation de la promotion' }
    }
}

