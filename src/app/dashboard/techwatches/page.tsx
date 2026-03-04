import { PageHero } from '@/components/ui/PageHero'
import { getTechWatches } from '@/features/techwatches/actions/techwatches.actions'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { requirePermission } from '@/lib/session'
import { TechWatchesClient } from '@/features/techwatches/components/TechWatchesClient'

export default async function TechWatchesPage() {
  await requirePermission('VIEW_TECHWATCHES')
  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
  const t = getT(lang)

  const { techWatches = [] } = await getTechWatches()

  return (
    <div className="animate-slide-up-fade">
      <PageHero
        title={t.hero.techwatches.title}
        description={t.hero.techwatches.description}
        label={t.nav.techwatches}
      />
      <div className="page-container" style={{ paddingTop: '0' }}>
        <TechWatchesClient data={techWatches} />
      </div>
    </div>
  )
}
