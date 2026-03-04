'use server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'

export interface AnalyticsStats {
    totalClients: number
    totalAdminUsers: number
    activeSubscriptions: number
    totalRevenue: number // Centimes
    newUsersLast30Days: number
    recentSubscribers: any[]
    revenueData: any[]
    usersGrowth: any[]
    subscriptionsDistribution: any[]
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
    await requirePermission('VIEW_ANALYTICS')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
        totalClients,
        totalAdminUsers,
        subscriptions,
        newUsersCount,
    ] = await Promise.all([
        // App-client users (role == USER)
        prisma.user.count({ where: { role: 'USER' } }),

        // Admin users (role != USER)
        prisma.user.count({ where: { role: { not: 'USER' } } }),

        // Subscriptions with plan (for revenue calc)
        prisma.subscription.findMany({
            where: { status: 'active' },
            include: { plan: true }
        }),

        // New client users last 30 days
        prisma.user.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        }),
    ])

    // Get 5 most recent active subscribers with user info
    const recentSubsDocs = await prisma.subscription.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            plan: true,
            user: {
                select: { name: true, email: true }
            }
        }
    })

    const recentSubscribers = recentSubsDocs.map((sub) => ({
        ...sub,
        userName: sub.user?.name ?? 'Utilisateur Inconnu',
        userEmail: sub.user?.email ?? '',
    }))

    const activeSubscriptions = subscriptions.length
    const totalRevenue = subscriptions.reduce((acc: number, sub: any) => acc + (sub.plan?.price || 0), 0)

    // Aggrégation: Distribution des abonnements par plan (Donut Chart)
    const distributionMap = new Map<string, number>()
    let totalAssigned = 0
    subscriptions.forEach((sub: any) => {
        const pName = sub.plan?.name || 'Inconnu'
        distributionMap.set(pName, (distributionMap.get(pName) || 0) + 1)
        totalAssigned++
    })

    // Add "Free" users for comparison in donut chart
    const freeUsersCounts = Math.max(0, totalClients - totalAssigned)
    if (freeUsersCounts > 0) {
        distributionMap.set('Gratuit', freeUsersCounts)
    }

    const subscriptionsDistribution = Array.from(distributionMap.entries()).map(([name, value]) => ({
        name,
        value
    }))

    // Aggrégation: Croissance utilisateurs 30 derniers jours (Area Chart)
    const usersLast30Docs = await prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' }
    })

    const growthMap = new Map<string, number>()
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        growthMap.set(dStr, 0)
    }

    usersLast30Docs.forEach((u: any) => {
        const d = u.createdAt
        const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        if (growthMap.has(dStr)) {
            growthMap.set(dStr, growthMap.get(dStr)! + 1)
        }
    })

    const usersGrowth = Array.from(growthMap.entries()).map(([date, users]) => ({
        date,
        users
    }))

    // Aggrégation: MRR historique simulé basé sur création d'abo (Bar Chart)
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

    // 1. Calculate the start date of the 6-month window
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // 2. Initialize the array of 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        return {
            year: d.getFullYear(),
            month: d.getMonth(),
            name: months[d.getMonth()],
            addedRevenue: 0
        }
    })

    // 3. Base MRR (before the 6-month window)
    let cumulativeRevenue = 0

    subscriptions.forEach((sub: any) => {
        const d = sub.createdAt as Date
        const price = (sub.plan?.price || 0) / 100

        if (d < sixMonthsAgo) {
            cumulativeRevenue += price
        } else {
            // Find the month bucket
            const bucket = last6Months.find(m => m.year === d.getFullYear() && m.month === d.getMonth())
            if (bucket) {
                bucket.addedRevenue += price
            }
        }
    })

    // 4. Generate the final cumulative MRR data
    const revenueData = last6Months.map(month => {
        cumulativeRevenue += month.addedRevenue
        return { name: month.name, total: cumulativeRevenue }
    })

    return {
        totalClients,
        totalAdminUsers,
        activeSubscriptions,
        totalRevenue,
        newUsersLast30Days: newUsersCount,
        recentSubscribers,
        revenueData,
        usersGrowth,
        subscriptionsDistribution
    }
}
