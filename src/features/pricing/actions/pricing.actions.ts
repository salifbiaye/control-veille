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

        // Count users who have NO subscription at all
        const usersWithoutSubscription = await prisma.user.count({
            where: {
                subscription: {
                    is: null
                }
            }
        })

        // Manual count for active subscriptions to ensure precision
        const plansWithCounts = await Promise.all(plans.map(async (plan) => {
            const activeCount = await prisma.subscription.count({
                where: {
                    planId: plan.id,
                    status: 'active'
                }
            })

            // If it's a FREE plan, add the ghosts (users without sub record)
            const isFree = plan.monthlyPrice === 0 && plan.yearlyPrice === 0
            const totalDisplayCount = isFree ? activeCount + usersWithoutSubscription : activeCount

            return {
                ...plan,
                _count: {
                    subscriptions: totalDisplayCount
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

import { stripe } from '@/lib/stripe'

export async function getPromotions() {
    try {
        await requirePermission('VIEW_PROMOTIONS')

        // On récupère les codes promos depuis Stripe (qui contiennent le coupon lié)
        const stripePromos = await stripe.promotionCodes.list({
            active: true,
            limit: 100,
            expand: ['data.coupon']
        })

        const promos = stripePromos.data.map(promo => {
            const coupon = (promo as any).coupon as import('stripe').Stripe.Coupon
            return {
                id: promo.id,
                code: promo.code,
                discountType: coupon.percent_off ? 'percentage' : 'fixed',
                discountValue: coupon.percent_off ? coupon.percent_off : (coupon.amount_off ? coupon.amount_off : 0),
                maxUses: promo.max_redemptions || coupon.max_redemptions || null,
                usedCount: promo.times_redeemed,
                expiresAt: promo.expires_at ? new Date(promo.expires_at * 1000) : (coupon.redeem_by ? new Date(coupon.redeem_by * 1000) : null),
                isActive: promo.active,
                // On n'a pas forcément le lien direct avec le plan local, sauf s'il est contenu dans les metadata du coupon
                plan: null
            }
        })

        return { success: true, promos }
    } catch (error) {
        console.error('[PRICING] getPromotions error:', error)
        return { success: false, promos: [], error: 'Erreur lors de la récupération des promos depuis Stripe' }
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

        // 1. Create Coupon first
        const couponData: import('stripe').Stripe.CouponCreateParams = {
            name: `Promo: ${data.code}`,
            duration: 'forever',
        }

        if (data.discountType === 'percentage') {
            couponData.percent_off = data.discountValue
        } else {
            couponData.amount_off = data.discountValue
            couponData.currency = 'eur'
        }

        if (data.maxUses) couponData.max_redemptions = data.maxUses
        if (data.expiresAt) couponData.redeem_by = Math.floor(data.expiresAt.getTime() / 1000)

        const coupon = await stripe.coupons.create(couponData)

        // 2. Create Promotion Code linked to Coupon
        await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: data.code,
            active: true,
            max_redemptions: data.maxUses ?? undefined,
            expires_at: data.expiresAt ? Math.floor(data.expiresAt.getTime() / 1000) : undefined,
        } as any) // Cast to any because of local TS mismatch on coupon property name in some versions

        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error: any) {
        console.error('[PRICING] createPromotion error:', error)
        return { success: false, error: error.message || 'Erreur lors de la création de la promotion' }
    }
}

export async function deletePromotion(promoCodeId: string) {
    try {
        await requirePermission('DELETE_PROMOTIONS')

        // Stripe promotion codes cannot be "deleted", only marked inactive
        await stripe.promotionCodes.update(promoCodeId, { active: false })

        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error: any) {
        console.error('[PRICING] deletePromotion error:', error)
        return { success: false, error: error.message || 'Erreur lors de la désactivation de la promotion' }
    }
}

