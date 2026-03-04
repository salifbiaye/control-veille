import { getAdminUsers, getClientUsers } from '@/features/users/actions/users.actions'
import { UsersClient } from '@/features/users/components/UsersClient'
import { PageHero } from '@/components/ui/PageHero'
import { Users } from 'lucide-react'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { requirePermission } from '@/lib/session'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  await requirePermission('VIEW_USERS')
  const cookieStore = await cookies()
  const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
  const t = getT(lang)

  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? '1'))

  const [adminUsers, clientUsers] = await Promise.all([
    getAdminUsers(),
    getClientUsers(page, 20),
  ])

  return (
    <div className={""}>
      <PageHero
        label={t.nav.users}
        title={t.hero.users.title}
        description={t.hero.users.description}
      />
      <div className="page-container" style={{ paddingTop: '28px' }}>
        <UsersClient adminUsers={adminUsers} clientUsers={clientUsers} />
      </div>
    </div>
  )
}
