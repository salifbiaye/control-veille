import { Settings as SettingsIcon } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { SettingsClient } from '@/features/settings/components/SettingsClient'
import { requireSession } from '@/lib/session'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
  const t = getT(lang)

  const session = await requireSession()

  return (
    <div className="animate-slide-up-fade">
      <PageHero
        title={t.hero.settings.title}
        description={t.hero.settings.description}
        label={t.nav.settings}
      />

      <div className="page-container" style={{ paddingTop: '0' }}>
        <SettingsClient user={session.user} />
      </div>
    </div>
  )
}
