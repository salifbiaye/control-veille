import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { SidebarProvider } from '@/components/layout/SidebarLayout'
import { DashboardShell } from '@/components/layout/DashboardShell'

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
            <SidebarProvider>
                <div className="flex">
                    <Sidebar user={session.user} />
                    <DashboardShell>
                        <Topbar
                            userName={session.user.name}
                            userEmail={session.user.email}
                        />
                        {/* pt-14 = 56px = height of fixed topbar */}
                        <main className="flex-1 pt-14">
                            {children}
                        </main>
                    </DashboardShell>
                </div>
            </SidebarProvider>
        </div>
    )
}
