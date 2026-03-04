'use server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'

export async function getTechWatches() {
    await requireSession()

    try {
        const techWatches = await prisma.techWatch.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                _count: {
                    select: {
                        articles: true,
                        tasks: true,
                        resources: true,
                        chatSessions: true,
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return { success: true, techWatches }
    } catch (error) {
        console.error('[getTechWatches]', error)
        return { success: false, techWatches: [] }
    }
}
