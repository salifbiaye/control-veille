import { getAnalyticsStats } from '@/features/analytics/actions/analytics.actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CreditCard, Activity, BarChart3, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RevenueChart } from '@/features/analytics/components/RevenueChart'
import { UsersGrowthChart } from '@/features/analytics/components/UsersGrowthChart'
import { SubscriptionsDonutChart } from '@/features/analytics/components/SubscriptionsDonutChart'
import { PageHero } from '@/components/ui/PageHero'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { requirePermission } from '@/lib/session'

export default async function AnalyticsPage() {
    await requirePermission('VIEW_ANALYTICS')
    const cookieStore = await cookies()
    const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
    const t = getT(lang)

    const stats = await getAnalyticsStats()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100)
    }

    const kpiCards = [
        {
            title: "Clients Totaux",
            value: stats.totalClients.toString(),
            change: `+${stats.newUsersLast30Days} ce mois`,
            icon: Users,
            color: "#3B82F6", // blue
        },
        {
            title: "MRR (Net)",
            value: formatCurrency(stats.totalRevenue),
            change: "Revenu Mensuel Récurrent",
            icon: CreditCard,
            color: "#10B981", // green
        },
        {
            title: "Abonnements Actifs",
            value: stats.activeSubscriptions.toString(),
            change: `${(stats.activeSubscriptions / Math.max(stats.totalClients, 1) * 100).toFixed(1)}% des inscrits`,
            icon: Activity,
            color: "#8B5CF6", // purple
        },
        {
            title: "Équipe Admin",
            value: stats.totalAdminUsers.toString(),
            change: "Accès dashboard",
            icon: ShieldCheck,
            color: "#F59E0B", // amber
        }
    ]

    return (
        <div className="animate-slide-up-fade">
            <PageHero
                title={t.hero.analytics.title}
                description={t.hero.analytics.description}
                label={t.nav.analytics}
            />

            <div className="page-container" style={{ paddingTop: '0' }}>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {kpiCards.map((stat, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden p-5 rounded-2xl border transition-all hover:-translate-y-1 flex flex-col gap-4 animate-scale-in"
                            style={{
                                animationDelay: `${i * 100}ms`,
                                background: 'var(--glass-bg)',
                                borderColor: 'var(--glass-border)',
                            }}
                        >
                            {/* Color Glow */}
                            <div
                                className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none opacity-20"
                                style={{ background: stat.color }}
                            />

                            <div className="flex items-start justify-between relative z-10">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:rotate-6 shadow-sm"
                                    style={{
                                        background: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                                        borderColor: `color-mix(in srgb, ${stat.color} 20%, transparent)`
                                    }}
                                >
                                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-white/5 border border-white/5" style={{ color: stat.color }}>
                                    Analytics
                                </span>
                            </div>

                            <div className="relative z-10">
                                <p className="text-4xl font-black tabular-nums tracking-tight" style={{ color: stat.color }}>
                                    {stat.value}
                                </p>
                                <div className="mt-1 flex flex-col">
                                    <p className="text-sm font-bold text-white tracking-wide">{stat.title}</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5 opacity-80">
                                        {stat.change}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
                    <RevenueChart data={stats.revenueData} />
                    <SubscriptionsDonutChart data={stats.subscriptionsDistribution} />
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 animate-slide-up-fade" style={{ animationDelay: '500ms' }}>

                    {/* Users Growth Chart (spanning 4 cols) */}
                    <div className="lg:col-span-4 rounded-2xl overflow-hidden h-full flex flex-col">
                        <UsersGrowthChart data={stats.usersGrowth} />
                    </div>

                    {/* Derniers Abonnés (spanning 3 cols) */}
                    <Card className="lg:col-span-3 bg-[var(--card-bg)] border-[var(--glass-border)] shadow-sm rounded-2xl flex flex-col h-full overflow-hidden">
                        <CardHeader className="border-b" style={{ borderColor: 'var(--glass-border)' }}>
                            <CardTitle className="text-white text-[15px]">Derniers Abonnés</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Historique des souscriptions actives.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <table className="premium-table h-full">
                                <thead>
                                    <tr>
                                        <th>Utilisateur</th>
                                        <th className="text-right">Abonnement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentSubscribers.length === 0 ? (
                                        <tr><td colSpan={2} className="text-center italic pb-8 pt-8">Aucun abonné récent</td></tr>
                                    ) : (
                                        stats.recentSubscribers.map((sub) => (
                                            <tr key={sub.id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 border border-white/10 rounded-lg">
                                                            {/* Ignore the Radix UI Type error for AvatarImage via @ts-ignore if it was failing, or just render it */}
                                                            {/* @ts-ignore AvatarImage issue */}
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${sub.userName}&backgroundColor=7c3aed`} />
                                                            {/* @ts-ignore AvatarFallback issue */}
                                                            <AvatarFallback className="rounded-lg">{sub.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium text-[var(--page-fg)]">{sub.userName}</p>
                                                            <p className="text-[11px] text-muted-foreground">{sub.userEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <div className="inline-flex flex-col items-end">
                                                        <span className="text-xs px-2 py-0.5 rounded border border-[var(--chrome-border)] bg-[rgba(255,255,255,0.03)] font-semibold text-purple-300">
                                                            {sub.plan?.name || '?'}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground mt-1">
                                                            +{formatCurrency(sub.plan?.monthlyPrice || 0)}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
