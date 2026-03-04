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
    price: number
    interval: string
    features: PlanFeatures
    isActive: boolean
    sortOrder: number
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

        // Manual count for active subscriptions to ensure precision
        const plansWithCounts = await Promise.all(plans.map(async (plan) => {
            const activeCount = await prisma.subscription.count({
                where: {
                    planId: plan.id,
                    status: 'active'
                }
            })
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
        const plan = await prisma.plan.create({
            data: {
                ...data,
                features: data.features as any, // Prisma Json type
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
        const plan = await prisma.plan.update({
            where: { id },
            data: {
                ...data,
                features: data.features ? (data.features as any) : undefined,
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

export async function getPromotions() {
    try {
        await requirePermission('VIEW_PROMOTIONS')
        const promos = await prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' },
            include: { plan: { select: { name: true } } }
        })
        return { success: true, promos }
    } catch (error) {
        console.error('[PRICING] getPromotions error:', error)
        return { success: false, promos: [], error: 'Erreur lors de la récupération des promos' }
    }
}

export async function createPromotion(data: PromotionData) {
    try {
        await requirePermission('EDIT_PROMOTIONS')
        const promo = await prisma.promotion.create({ data })
        revalidatePath('/dashboard/pricing')
        return { success: true, promo }
    } catch (error) {
        console.error('[PRICING] createPromotion error:', error)
        return { success: false, error: 'Le code promo existe peut-être déjà' }
    }
}

export async function togglePromotion(id: string, isActive: boolean) {
    try {
        await requirePermission('EDIT_PROMOTIONS')
        await prisma.promotion.update({
            where: { id },
            data: { isActive },
        })
        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error) {
        console.error('[PRICING] togglePromotion error:', error)
        return { success: false, error: 'Impossible de modifier le statut de la promo' }
    }
}

export async function deletePromotion(id: string) {
    try {
        await requirePermission('DELETE_PROMOTIONS')
        await prisma.promotion.delete({ where: { id } })
        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error) {
        console.error('[PRICING] deletePromotion error:', error)
        return { success: false, error: 'Impossible de supprimer cette promo' }
    }
}
