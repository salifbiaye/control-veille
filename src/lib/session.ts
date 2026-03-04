import { auth } from './auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_PERMISSIONS, AdminRole, hasPermission } from './permissions'
import { prisma } from './prisma'

export async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    })
}

export async function requireSession() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }
    return session
}

export async function requirePermission(permission: keyof typeof ADMIN_PERMISSIONS) {
    const session = await requireSession()

    // Always re-read the role from admin_users in DB (source of truth).
    // Never trust session.user.role: Better-Auth does not always inject
    // custom additionalFields into the server-side session object reliably.
    const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    })

    if (!adminUser) {
        throw new Error('Admin user not found in database')
    }

    // Default to READ_ONLY (least privilege) if role is somehow missing
    const role = ((adminUser.role as AdminRole) || 'READ_ONLY')

    if (!hasPermission(role, permission)) {
        redirect('/dashboard')
    }

    return session
}

