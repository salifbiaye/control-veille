'use server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { stripe } from '@/lib/stripe'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'READ_ONLY'

export type AdminUser = {
    id: string
    name: string | null
    email: string
    role: AdminRole
    createdAt: Date
    emailVerified: boolean
}

export type ClientUser = {
    id: string
    name: string
    email: string
    emailVerified: boolean
    createdAt: Date
    techWatchCount: number
    storageUsed: number
    storageLimit: number
    planName: string | null
    subscriptionId: string | null
    subscriptionStatus: string | null
    isPremiumLifetime: boolean
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
}

export type PaginatedResult<T> = {
    data: T[]
    meta: { page: number; limit: number; total: number; totalPages: number }
}

// ─────────────────────────────────────────────────────────────
// Admin Users
// ─────────────────────────────────────────────────────────────

export async function getAdminUsers(): Promise<AdminUser[]> {
    try {
        await requirePermission('VIEW_USERS')
        const users = await prisma.user.findMany({
            where: { role: { not: 'USER' } },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                emailVerified: true,
            },
        })
        return users.map((u) => ({
            ...u,
            role: u.role as AdminRole,
        }))
    } catch (error) {
        console.error('[ADMIN_USERS] Error:', error)
        return []
    }
}

export async function updateAdminUserRole(
    id: string,
    newRole: AdminRole
): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('EDIT_USERS')

        const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } })
        if (!targetUser) return { success: false, error: 'Utilisateur non trouvé' }

        // 🔒 Impossible de modifier un SUPER_ADMIN
        if (targetUser.role === 'SUPER_ADMIN') {
            return { success: false, error: 'Impossible de modifier un Super Admin' }
        }
        // 🔒 Impossible de promouvoir à SUPER_ADMIN via l'interface normale
        if (newRole === 'SUPER_ADMIN') {
            return { success: false, error: 'Impossible de promouvoir directement au rang de Super Admin' }
        }
        // Anti-promotion/demotion guard (client ↔ admin)
        if (targetUser.role === 'USER') return { success: false, error: 'Impossible de promouvoir un client' }
        if ((newRole as string) === 'USER') return { success: false, error: 'Impossible de rétrograder en client' }

        await prisma.user.update({ where: { id }, data: { role: newRole } })
        return { success: true }
    } catch (error) {
        console.error('[ADMIN_USERS] Update role error:', error)
        return { success: false, error: 'Impossible de mettre à jour le rôle' }
    }
}

export async function revokeAdminUser(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('DELETE_USERS')

        const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } })
        if (!targetUser || targetUser.role === 'USER') return { success: false, error: 'Action invalide' }

        // 🔒 Un SUPER_ADMIN ne peut jamais être révoqué
        if (targetUser.role === 'SUPER_ADMIN') {
            return { success: false, error: 'Impossible de révoquer un Super Admin' }
        }

        await prisma.user.update({ where: { id }, data: { role: 'READ_ONLY' } })
        return { success: true }
    } catch (error) {
        console.error('[ADMIN_USERS] Revoke error:', error)
        return { success: false, error: "Impossible de révoquer l'accès" }
    }
}

// ─────────────────────────────────────────────────────────────
// Client Users
// ─────────────────────────────────────────────────────────────

export async function getClientUsers(): Promise<ClientUser[]> {
    try {
        await requirePermission('VIEW_USERS')

        const rows = await prisma.$queryRaw<ClientUser[]>`
        SELECT
          u.id,
          u.name,
          u.email,
          u."emailVerified",
          u."createdAt",
          u."storageUsed",
          u."isPremiumLifetime",
          COUNT(tw.id)::int AS "techWatchCount",
          MAX(s.id) AS "subscriptionId",
          MAX(s.status) AS "subscriptionStatus",
          MAX(s."currentPeriodEnd") AS "currentPeriodEnd",
          BOOL_OR(s."cancelAtPeriodEnd") AS "cancelAtPeriodEnd",
          MAX(p.name) AS "planName",
          COALESCE(
            MAX((p.features->>'storage')::numeric::bigint),
            CASE WHEN BOOL_OR(u."isPremiumLifetime") THEN (SELECT (features->>'storage')::numeric::bigint FROM "plans" WHERE slug = 'pro' LIMIT 1) ELSE NULL END,
            (SELECT (features->>'storage')::numeric::bigint FROM "plans" WHERE slug = 'free' LIMIT 1),
            1073741824
          ) AS "storageLimit"
        FROM "user" u
        LEFT JOIN "TechWatch" tw ON tw."userId" = u.id
        LEFT JOIN "Subscription" s ON s."userId" = u.id AND s.status = 'active'
        LEFT JOIN "plans" p ON s."planId" = p.id
        WHERE u.role IN ('USER', 'BANNED')
        GROUP BY u.id
        ORDER BY u."createdAt" DESC
      `

        return rows
    } catch (error) {
        console.error('[CLIENT_USERS] Error:', error)
        return []
    }
}

export async function getClientUserById(id: string): Promise<ClientUser | null> {
    try {
        await requirePermission('VIEW_USERS')
        const rows = await prisma.$queryRaw<ClientUser[]>`
      SELECT
        u.id,
        u.name,
        u.email,
        u."emailVerified",
        u."createdAt",
        u."storageUsed",
        MAX(s.id) AS "subscriptionId",
        u."isPremiumLifetime",
        MAX(p.name) AS "planName",
        COALESCE(
          MAX((p.features->>'storage')::numeric::bigint),
          CASE WHEN BOOL_OR(u."isPremiumLifetime") THEN (SELECT (features->>'storage')::numeric::bigint FROM "plans" WHERE slug = 'pro' LIMIT 1) ELSE NULL END,
          (SELECT (features->>'storage')::numeric::bigint FROM "plans" WHERE slug = 'free' LIMIT 1),
          1073741824
        ) AS "storageLimit"
      FROM "user" u
      LEFT JOIN "TechWatch" tw ON tw."userId" = u.id
      LEFT JOIN "Subscription" s ON s."userId" = u.id AND s.status = 'active'
      LEFT JOIN "plans" p ON s."planId" = p.id
      WHERE u.id = ${id} AND u.role IN ('USER', 'BANNED')
      GROUP BY u.id
    `
        return rows[0] ?? null
    } catch (error) {
        console.error('[CLIENT_USERS] GetById error:', error)
        return null
    }
}

// ─────────────────────────────────────────────────────────────
// isPremiumLifetime toggle
// ─────────────────────────────────────────────────────────────

export async function togglePremiumLifetime(
    userId: string,
    value: boolean
): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('EDIT_USERS')

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
        if (!user || user.role !== 'USER') {
            return { success: false, error: 'Utilisateur introuvable ou non-client' }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { isPremiumLifetime: value } as any,
        })
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error('[CLIENT_USERS] togglePremiumLifetime error:', error)
        return { success: false, error: 'Impossible de modifier le statut Premium Lifetime' }
    }
}

// ─────────────────────────────────────────────────────────────
// Ban User
// ─────────────────────────────────────────────────────────────

export async function banUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('EDIT_USERS')

        const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
        if (!targetUser) return { success: false, error: 'Utilisateur non trouvé' }

        if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') {
            return { success: false, error: 'Impossible de bannir un administrateur' }
        }

        // 🔒 Annuler l'abonnement Stripe si présent
        const activeSub = await prisma.subscription.findUnique({
            where: { userId },
            select: { stripeSubscriptionId: true, status: true }
        })

        if (activeSub && (activeSub as any).stripeSubscriptionId && activeSub.status === 'active') {
            try {
                await stripe.subscriptions.update((activeSub as any).stripeSubscriptionId, {
                    cancel_at_period_end: false,
                })
                await stripe.subscriptions.cancel((activeSub as any).stripeSubscriptionId)

                await prisma.subscription.update({
                    where: { userId },
                    data: { status: 'canceled' }
                })
            } catch (stripeError) {
                console.error('[BAN_USER] Stripe cancellation error:', stripeError)
                // On continue quand même le ban en base
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: 'BANNED' }
        })
        revalidatePath('/dashboard/users')
        revalidatePath('/dashboard/pricing')
        return { success: true }
    } catch (error) {
        console.error('[CLIENT_USERS] banUser error:', error)
        return { success: false, error: 'Impossible de bannir l\'utilisateur' }
    }
}

export async function unbanUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requirePermission('EDIT_USERS')
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' }
        })
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error('[CLIENT_USERS] unbanUser error:', error)
        return { success: false, error: 'Impossible de débannir l\'utilisateur' }
    }
}
