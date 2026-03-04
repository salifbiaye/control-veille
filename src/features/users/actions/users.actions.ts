'use server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'

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
    storageLimit: number          // dynamique depuis plan.features.storage
    planName: string | null
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

export async function getClientUsers(
    page = 1,
    limit = 20
): Promise<PaginatedResult<ClientUser>> {
    try {
        await requirePermission('VIEW_USERS')
        const offset = (page - 1) * limit

        const [rows, countResult] = await Promise.all([
            prisma.$queryRaw<ClientUser[]>`
        SELECT
          u.id,
          u.name,
          u.email,
          u."emailVerified",
          u."createdAt",
          u."storageUsed",
          u."isPremiumLifetime",
          COUNT(tw.id)::int AS "techWatchCount",
          MAX(s.status) AS "subscriptionStatus",
          MAX(s."currentPeriodEnd") AS "currentPeriodEnd",
          BOOL_OR(s."cancelAtPeriodEnd") AS "cancelAtPeriodEnd",
          MAX(p.name) AS "planName",
          COALESCE(
            (MAX(p.features::text)::jsonb->>'storage')::bigint,
            536870912
          ) AS "storageLimit"
        FROM "user" u
        LEFT JOIN "TechWatch" tw ON tw."userId" = u.id
        LEFT JOIN "Subscription" s ON s."userId" = u.id AND s.status = 'active'
        LEFT JOIN "plans" p ON s."planId" = p.id
        WHERE u.role = 'USER'
        GROUP BY u.id
        ORDER BY u."createdAt" DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
            prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*)::int FROM "user" WHERE role = 'USER'`,
        ])

        const total = Number(countResult[0]?.count ?? 0)

        return {
            data: rows,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        }
    } catch (error) {
        console.error('[CLIENT_USERS] Error:', error)
        return { data: [], meta: { page, limit, total: 0, totalPages: 0 } }
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
        u."isPremiumLifetime",
        COUNT(tw.id)::int AS "techWatchCount",
        536870912 AS "storageLimit",
        NULL AS "subscriptionStatus",
        NULL AS "currentPeriodEnd",
        false AS "cancelAtPeriodEnd",
        NULL AS "planName"
      FROM "user" u
      LEFT JOIN "TechWatch" tw ON tw."userId" = u.id
      WHERE u.id = ${id} AND u.role = 'USER'
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
            data: { isPremiumLifetime: value } as any, // Prisma will regenerate after db push
        })
        return { success: true }
    } catch (error) {
        console.error('[CLIENT_USERS] togglePremiumLifetime error:', error)
        return { success: false, error: 'Impossible de modifier le statut Premium Lifetime' }
    }
}
