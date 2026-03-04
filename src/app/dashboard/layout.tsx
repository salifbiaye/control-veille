import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--page-bg)' }}>
      <div className="flex">
        <Sidebar user={session.user} />
        <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '224px' }}>
          <Topbar
            userName={session.user.name}
            userEmail={session.user.email}
          />
          {/* pt-14 = 56px = height of fixed header so content doesn't go under it */}
          <main className="flex-1 pt-14">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

