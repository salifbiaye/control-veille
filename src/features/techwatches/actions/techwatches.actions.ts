'use server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export type TechWatchDetails = {
    id: string
    name: string
    description: string | null
    iconEmoji: string | null
    color: string | null
    logoUrl: string | null
    createdAt: Date
    updatedAt: Date
    user: {
        name: string | null
        email: string
        image: string | null
    }
    _count: {
        articles: number
        tasks: number
        resources: number
    }
}

export type PaginatedResult<T> = {
    data: T[]
    meta: { page: number; limit: number; total: number; totalPages: number }
}

export async function getTechWatches(
    page = 1,
    limit = 10,
    search = ''
): Promise<PaginatedResult<TechWatchDetails>> {
    await requireSession()

    try {
        const skip = (page - 1) * limit

        // Build where clause for search
        const where = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' as const } },
                      { description: { contains: search, mode: 'insensitive' as const } },
                      { user: { name: { contains: search, mode: 'insensitive' as const } } },
                      { user: { email: { contains: search, mode: 'insensitive' as const } } },
                  ],
              }
            : {}

        const [techWatches, total] = await Promise.all([
            prisma.techWatch.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: {
                            articles: true,
                            tasks: true,
                            resources: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            }),
            prisma.techWatch.count({ where }),
        ])

        return {
            data: techWatches,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error('[getTechWatches]', error)
        return { data: [], meta: { page: 1, limit, total: 0, totalPages: 0 } }
    }
}
export async function deleteTechWatch(id: string) {
    await requireSession()
    try {
        await prisma.techWatch.delete({ where: { id } })
        revalidatePath('/dashboard/techwatches')
        return { success: true }
    } catch (error) {
        console.error('[deleteTechWatch]', error)
        return { success: false, error: 'Erreur lors de la suppression' }
    }
}
