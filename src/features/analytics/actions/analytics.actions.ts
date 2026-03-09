'use server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { getPaymentProvider } from '@/lib/payment'

export interface AnalyticsStats {
    totalClients: number
    totalAdminUsers: number
    activeSubscriptions: number
    totalRevenue: number // This will now represent MRR in centimes
    newUsersLast30Days: number
    recentSubscribers: any[]
    revenueData: any[]
    usersGrowth: any[]
    subscriptionsGrowth: any[]
    techWatchesGrowth: any[]
    subscriptionsDistribution: any[]
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
    await requirePermission('VIEW_ANALYTICS')

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Parallel calls: DB counts + Stripe MRR
    const [
        totalClients,
        totalAdminUsers,
        subscriptions,
        newUsersCount,
        techWatchesLast30,
        activeSubsLast30,
        stripeMRR,
    ] = await Promise.all([
        // App-client users (role == USER)
        prisma.user.count({ where: { role: 'USER' } }),

        // Admin users (role != USER)
        prisma.user.count({ where: { role: { not: 'USER' } } }),

        // Subscriptions with plan (for analytics charts)
        prisma.subscription.findMany({
            where: { status: 'active' },
            include: { plan: true }
        }),

        // New client users last 30 days
        prisma.user.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        }),

        // New TechWatches last 30 days
        prisma.techWatch.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' }
        }),

        // New Subscriptions last 30 days
        prisma.subscription.findMany({
            where: { createdAt: { gte: thirtyDaysAgo }, status: 'active' },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' }
        }),

        // Real-time MRR from payment provider
        getPaymentProvider().calculateMRR()
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
    const totalRevenue = stripeMRR // Centimes (Monthly Recurring Revenue)

    // Aggrégation: Distribution des abonnements par plan (Donut Chart)
    const distributionMap = new Map<string, number>()
    let totalAssigned = 0
    subscriptions.forEach((sub: any) => {
        const pName = sub.plan?.name || 'Inconnu'
        distributionMap.set(pName, (distributionMap.get(pName) || 0) + 1)
        totalAssigned++
    })

    // Find the free plan from DB if it exists to use its name
    const freeManualPlan = await prisma.plan.findFirst({
        where: { monthlyPrice: 0, yearlyPrice: 0, stripeMonthlyPriceId: null, paddlePriceIdMonthly: null }
    })
    const freePlanName = freeManualPlan ? freeManualPlan.name : 'Gratuit'

    // Add "Free" users for comparison in donut chart
    const freeUsersCounts = Math.max(0, totalClients - totalAssigned)
    if (freeUsersCounts > 0) {
        const existing = distributionMap.get(freePlanName) || 0
        distributionMap.set(freePlanName, existing + freeUsersCounts)
    }

    const subscriptionsDistribution = Array.from(distributionMap.entries()).map(([name, value]) => ({
        name,
        value
    }))

    // Helper to initialize 30 days growth map
    const init30DaysMap = () => {
        const m = new Map<string, number>()
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
            m.set(dStr, 0)
        }
        return m
    }

    // Aggrégation: Croissance utilisateurs par rôle 30 derniers jours (Area Chart)
    const usersLast30Docs = await prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, role: true },
        orderBy: { createdAt: 'asc' }
    })

    const usersGrowthMap = new Map<string, Record<string, number>>()
    // Initialize map with empty objects for each of the last 30 days
    for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        usersGrowthMap.set(dStr, {
            users: 0,
            USER: 0,
            ADMIN: 0,
            SUPER_ADMIN: 0,
            SUPPORT: 0,
            READ_ONLY: 0
        })
    }

    usersLast30Docs.forEach((u: any) => {
        const d = u.createdAt
        const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        const role = u.role || 'USER'

        if (usersGrowthMap.has(dStr)) {
            const counts = usersGrowthMap.get(dStr)!
            counts.users++
            // Only count known roles
            if (counts.hasOwnProperty(role)) {
                counts[role]++
            }
        }
    })

    const usersGrowth = Array.from(usersGrowthMap.entries()).map(([date, roles]) => ({
        date,
        ...roles
    }))

    // Aggrégation: Croissance TechWatches
    const twGrowthMap = init30DaysMap()
    techWatchesLast30.forEach((tw: any) => {
        const d = tw.createdAt
        const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        if (twGrowthMap.has(dStr)) {
            twGrowthMap.set(dStr, twGrowthMap.get(dStr)! + 1)
        }
    })
    const techWatchesGrowth = Array.from(twGrowthMap.entries()).map(([date, count]) => ({ date, count }))

    // Aggrégation: Croissance Subscriptions
    const subGrowthMap = init30DaysMap()
    activeSubsLast30.forEach((sub: any) => {
        const d = sub.createdAt
        const dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        if (subGrowthMap.has(dStr)) {
            subGrowthMap.set(dStr, subGrowthMap.get(dStr)! + 1)
        }
    })
    const subscriptionsGrowth = Array.from(subGrowthMap.entries()).map(([date, count]) => ({ date, count }))

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
        const price = (typeof sub.pricePaid === 'number' ? sub.pricePaid : (sub.plan?.monthlyPrice || 0)) / 100

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
        subscriptionsGrowth,
        techWatchesGrowth,
        subscriptionsDistribution
    }
}


