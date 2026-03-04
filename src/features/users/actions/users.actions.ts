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
    storageLimit: number
    planName: string | null
    subscriptionStatus: string | null
}

export type PaginatedResult<T> = {
    data: T[]
    meta: { page: number; limit: number; total: number; totalPages: number }
}

// ─────────────────────────────────────────────────────────────
// Admin Users (table user, role != 'USER')
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

        // Anti-promotion/demotion guard
        // We cannot promote a normal client to an admin here, nor demote an admin to a client.
        const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } })
        if (!targetUser) return { success: false, error: 'Utilisateur non trouvé' }
        if (targetUser.role === 'USER') return { success: false, error: 'Impossible de promouvoir un client' }
        if (newRole as string === 'USER') return { success: false, error: 'Impossible de rétrograder en client' }

        await prisma.user.update({
            where: { id },
            data: { role: newRole },
        })
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

        // Downgrade to READ_ONLY instead of deleting
        await prisma.user.update({
            where: { id },
            data: { role: 'READ_ONLY' },
        })
        return { success: true }
    } catch (error) {
        console.error('[ADMIN_USERS] Revoke error:', error)
        return { success: false, error: 'Impossible de révoquer l\'accès' }
    }
}

// ─────────────────────────────────────────────────────────────
// Client Users (table user, role == 'USER')
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
          -- u."storageLimit", // storageLimit doesn't exist on user table (was a mistake in previous query)
          1024 * 1024 * 512 AS "storageLimit", -- 512MB default
          COUNT(tw.id)::int AS "techWatchCount",
          MAX(s.status) AS "subscriptionStatus",
          MAX(p.name) AS "planName"
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
        return {
            data: [],
            meta: { page, limit, total: 0, totalPages: 0 },
        }
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
        1024 * 1024 * 512 AS "storageLimit",
        COUNT(tw.id)::int AS "techWatchCount"
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
