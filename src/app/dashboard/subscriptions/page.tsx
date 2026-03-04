import { Receipt } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { getSubscriptions } from '@/features/subscriptions/actions/subscriptions.actions'
import { SubscriptionsClient } from '@/features/subscriptions/components/SubscriptionsClient'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const cookieStore = await cookies()
    const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
    const t = getT(lang)

    const params = await searchParams
    const page = Number(params.page) || 1

    // Fetch paginated subscriptions
    const subsData = await getSubscriptions(page, 20)

    return (
        <div className="animate-slide-up-fade">
            <PageHero
                title={t.hero.subscriptions.title}
                description={t.hero.subscriptions.description}
                label={t.nav.subscriptions}
            />

            <div className="page-container" style={{ paddingTop: '0' }}>
                <SubscriptionsClient initial={subsData} />
            </div>
        </div>
    )
}
