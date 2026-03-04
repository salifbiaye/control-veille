import { prisma } from '@/lib/prisma'

// GET /api/pricing/plans
// PUBLIC endpoint for app-client to fetch active plans
// No auth required
export async function GET() {
    try {
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                interval: true,
                features: true,
                sortOrder: true,
            },
        })

        return new Response(JSON.stringify(plans), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                // Cache for 60 seconds, serve stale content while revalidating for 5 mins
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        })
    } catch (error) {
        console.error('[API_PRICING] Error fetching public plans:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
