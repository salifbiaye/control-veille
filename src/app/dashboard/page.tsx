import { getDashboardStats } from '@/features/dashboard/actions/dashboard.actions'
import { getAnalyticsStats } from '@/features/analytics/actions/analytics.actions'
import { PageHero } from '@/components/ui/PageHero'
import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { RecentUsers } from '@/features/dashboard/components/RecentUsers'
import { RecentTechWatches } from '@/features/dashboard/components/RecentTechWatches'
import { DashboardGrowthCharts } from '@/features/dashboard/components/DashboardGrowthCharts'
import { QuickActions } from '@/features/dashboard/components/QuickActions'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const analytics = await getAnalyticsStats()

  return (
    <div className="animate-slide-up-fade w-full">
      <PageHero
        label="Admin Dashboard"
        title="Dashboard"
        description="Vue d'ensemble de la plateforme TechWatch. Supervisez les métriques clés en temps réel."
        accentColor="var(--brand)"
      />

      <div className="page-container" style={{ paddingTop: '0' }}>

        {/* KPI Cards */}
        <DashboardStats stats={stats} />

        {/* Bottom Rows: Recent Activity & Quick Actions */}
        <div className="space-y-6 lg:space-y-8">

          {/* Row 1: Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
            <RecentUsers users={stats.recentActivity.users} />
            <RecentTechWatches techWatches={stats.recentActivity.techWatches} />
          </div>

          {/* Row 2: Growth Charts */}
          <div className="animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
            <DashboardGrowthCharts usersGrowth={analytics.usersGrowth} revenueData={analytics.revenueData} />
          </div>

          {/* Row 3: Shortcuts */}
          <div className="animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}
