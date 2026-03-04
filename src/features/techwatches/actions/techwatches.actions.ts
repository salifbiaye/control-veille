'use server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

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
