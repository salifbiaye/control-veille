import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'

export async function getDashboardStats() {
  await requirePermission('VIEW_DASHBOARD')
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    newUsers,
    totalTechWatches,
    newTechWatches,
    totalArticles,
    newArticles,
    totalTasks,
    completedTasks,
    pendingTasks,
    recentUsers,
    recentTechWatches
  ] = await Promise.all([
    // Client users
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: thirtyDaysAgo } } }),

    // TechWatch stats
    prisma.techWatch.count(),
    prisma.techWatch.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

    // Content stats
    prisma.article.count(),
    prisma.article.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),

    // Tasks stats
    prisma.task.count(),
    prisma.task.count({ where: { completed: true } }),
    prisma.task.count({ where: { completed: false } }),

    // Recent Activity
    prisma.user.findMany({
      where: { role: 'USER' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true, subscription: { select: { plan: { select: { name: true } } } } }
    }),
    prisma.techWatch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true, user: { select: { name: true, email: true } }, _count: { select: { articles: true, tasks: true } } }
    })
  ])

  return {
    users: {
      total: totalUsers,
      growth: `+${newUsers} récent${newUsers > 1 ? 's' : ''}`
    },
    techWatches: {
      total: totalTechWatches,
      growth: `+${newTechWatches} récent${newTechWatches > 1 ? 's' : ''}`
    },
    content: {
      articles: totalArticles,
      growth: `+${newArticles} récent${newArticles > 1 ? 's' : ''}`
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    },
    recentActivity: {
      users: recentUsers,
      techWatches: recentTechWatches
    }
  }
}

export async function getUsersList(page = 1, limit = 20) {
  await requirePermission('VIEW_USERS')
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      include: {
        subscription: {
          select: { status: true, plan: { select: { name: true } } }
        },
        _count: {
          select: { techWatches: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ])

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getTechWatchesList(page = 1, limit = 20) {
  await requirePermission('VIEW_TECHWATCHES')
  const skip = (page - 1) * limit

  const [techWatches, total] = await Promise.all([
    prisma.techWatch.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: { name: true, email: true }
        },
        _count: {
          select: { articles: true, tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.techWatch.count()
  ])

  return {
    techWatches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
