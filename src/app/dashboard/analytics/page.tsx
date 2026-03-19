import { getAnalyticsStats } from '@/features/analytics/actions/analytics.actions'
import { Users, CreditCard, Activity, ShieldCheck, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RevenueChart } from '@/features/analytics/components/RevenueChart'
import { UsersGrowthChart } from '@/features/analytics/components/UsersGrowthChart'
import { SubscriptionsDonutChart } from '@/features/analytics/components/SubscriptionsDonutChart'
import { cookies } from 'next/headers'
import { getT, type Locale } from '@/lib/i18n'
import { requirePermission } from '@/lib/session'

export default async function AnalyticsPage() {
    await requirePermission('VIEW_ANALYTICS')
    const cookieStore = await cookies()
    const lang = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'fr'
    const t = getT(lang)
    const a = t.analytics

    const stats = await getAnalyticsStats()

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100)

    const mrrFormatted = formatCurrency(stats.totalRevenue)
    const growthPct = stats.newUsersLast30Days > 0
        ? `+${Math.round((stats.newUsersLast30Days / Math.max(stats.totalClients - stats.newUsersLast30Days, 1)) * 100)}%`
        : '0%'

    const kpiCards = [
        {
            title: a.kpi.clients,
            value: stats.totalClients.toLocaleString('fr-FR'),
            change: `+${stats.newUsersLast30Days} ${a.kpi.clientsDesc}`,
            icon: Users,
            color: "#3B82F6",
        },
        {
            title: a.kpi.mrr,
            value: mrrFormatted,
            change: a.kpi.mrrDesc,
            icon: CreditCard,
            color: "#10B981",
        },
        {
            title: a.kpi.active,
            value: stats.activeSubscriptions.toString(),
            change: `${(stats.activeSubscriptions / Math.max(stats.totalClients, 1) * 100).toFixed(1)}% ${a.kpi.activeDesc}`,
            icon: Activity,
            color: "#8B5CF6",
        },
        {
            title: a.kpi.team,
            value: stats.totalAdminUsers.toString(),
            change: a.kpi.teamDesc,
            icon: ShieldCheck,
            color: "#F59E0B",
        },
    ]

    const fakeCode = (str: string) => {
        const h = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
        const a = h.toString(16).padStart(4, '0').toUpperCase().slice(-4)
        const b = (h * 7).toString(16).padStart(4, '0').toUpperCase().slice(-4)
        return `${a}...${b}`
    }

    return (
        <div className="animate-slide-up-fade min-h-screen">
            <div className="page-container" style={{ paddingTop: '1.5rem' }}>

                {/* ── Hero Banner ── */}
                <div
                    className="relative overflow-hidden rounded-3xl mb-8"
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--glass-border)',
                    }}
                >
                    {/* Purple glow overlay */}
                    <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
                    <div className="absolute -bottom-10 left-[30%] w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }} />

                    <div className="relative z-10 p-6 sm:p-8">
                        {/* Title row */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5"
                                    style={{ color: 'var(--txt-muted)' }}>
                                    {a.label}
                                </p>
                                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--page-fg)' }}>
                                    {a.badge}
                                </h1>
                            </div>
                            <span
                                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full mt-1"
                                style={{ background: 'rgba(139,92,246,0.10)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.18)' }}
                            >
                                <TrendingUp className="w-3 h-3" />
                                {a.badge}
                            </span>
                        </div>

                        {/* MRR + VISA card */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
                            {/* Left: MRR value */}
                            <div className="flex-1">
                                <p className="text-sm font-medium mb-2" style={{ color: 'var(--txt-sub)' }}>
                                    {a.totalMrr}
                                </p>
                                <div className="flex items-end gap-3 flex-wrap">
                                    <span
                                        className="text-4xl sm:text-5xl font-black tracking-tighter leading-none tabular-nums"
                                        style={{ color: 'var(--page-fg)' }}
                                    >
                                        {mrrFormatted}
                                    </span>
                                </div>
                                <p className="text-xs mt-3" style={{ color: 'var(--txt-muted)' }}>
                                    {a.updated}
                                </p>
                            </div>

                            {/* Right: VISA card — always dark purple, all text forced white */}
                            <div
                                className="relative w-[230px] h-[138px] rounded-2xl overflow-hidden flex-shrink-0 hidden sm:flex flex-col justify-between p-5 select-none"
                                style={{
                                    background: 'linear-gradient(135deg, #3B1F8C 0%, #7C3AED 60%, #6D28D9 100%)',
                                    boxShadow: '0 12px 35px rgba(124,58,237,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
                                }}
                            >
                                {/* Shine overlay */}
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-[30px]"
                                    style={{ background: 'rgba(255,255,255,0.12)' }} />

                                <div className="relative flex items-start justify-between">
                                    <div>
                                        <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                            TechWatches
                                        </p>
                                        <p style={{ color: '#fff', fontWeight: 800, fontSize: '13px', marginTop: '2px' }}>
                                            {a.card.name}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.15)' }}>
                                        <CreditCard className="w-4 h-4" style={{ color: '#fff' }} />
                                    </div>
                                </div>

                                <div className="relative flex items-end justify-between">
                                    <div>
                                        <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                                            {a.card.activeSubs}
                                        </p>
                                        <p style={{ color: '#fff', fontWeight: 900, fontSize: '22px', marginTop: '1px', fontVariantNumeric: 'tabular-nums' }}>
                                            {stats.activeSubscriptions}
                                        </p>
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.50)', fontWeight: 900, fontSize: '13px', letterSpacing: '0.12em' }}>
                                        VISA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpiCards.map((stat, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-2xl flex flex-col gap-3 animate-scale-in transition-transform hover:-translate-y-0.5"
                            style={{
                                animationDelay: `${i * 80}ms`,
                                background: 'var(--card-bg)',
                                border: '1px solid var(--glass-border)',
                                borderLeft: `3px solid ${stat.color}`,
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: `${stat.color}12`, border: `1px solid ${stat.color}22` }}>
                                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                                </div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[130px]"
                                    style={{ background: `${stat.color}10`, color: stat.color }}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <p className="text-2xl font-black tabular-nums tracking-tight leading-tight"
                                    style={{ color: 'var(--page-fg)' }}>
                                    {stat.value}
                                </p>
                                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--txt-sub)' }}>
                                    {stat.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
                    <div className="lg:col-span-4">
                        <RevenueChart data={stats.revenueData} labels={a.chart.revenue} />
                    </div>
                    <div className="lg:col-span-3">
                        <SubscriptionsDonutChart data={stats.subscriptionsDistribution} labels={a.chart.donut} />
                    </div>
                </div>

                {/* ── Bottom Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-10 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
                    <div className="lg:col-span-4">
                        <UsersGrowthChart data={stats.usersGrowth} labels={a.chart.growth} />
                    </div>

                    {/* Transactions */}
                    <div
                        className="lg:col-span-3 rounded-2xl overflow-hidden flex flex-col"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                    >
                        {/* Header */}
                        <div className="px-5 pt-5 pb-3.5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold" style={{ color: 'var(--page-fg)' }}>
                                        {a.table.title}
                                    </h3>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                        style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                                        {stats.recentSubscribers.length}
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium" style={{ color: 'var(--txt-muted)' }}>
                                    {a.table.subtitle}
                                </span>
                            </div>
                        </div>

                        {/* Column labels */}
                        <div className="grid px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                            style={{
                                gridTemplateColumns: '1fr auto auto auto',
                                color: 'var(--txt-muted)',
                                borderBottom: '1px solid var(--glass-border)',
                            }}>
                            <span>{a.table.assets}</span>
                            <span className="px-3">{a.table.codeId}</span>
                            <span className="px-3">{a.table.status}</span>
                            <span className="text-right">{a.table.value}</span>
                        </div>

                        {/* Rows */}
                        <div className="flex-1 overflow-auto">
                            {stats.recentSubscribers.length === 0 ? (
                                <div className="text-center py-12 text-sm" style={{ color: 'var(--txt-muted)' }}>
                                    {a.table.empty}
                                </div>
                            ) : (
                                stats.recentSubscribers.map((sub) => {
                                    const isAnnual = sub.plan && sub.pricePaid === sub.plan.yearlyPrice && sub.plan.yearlyPrice > 0
                                    const intervalLabel = isAnnual ? a.table.annual : a.table.monthly
                                    const displayPrice = typeof sub.pricePaid === 'number' && sub.pricePaid > 0 ? sub.pricePaid : (sub.plan?.monthlyPrice || 0)

                                    return (
                                        <div
                                            key={sub.id}
                                            className="grid items-center px-5 py-3.5 transition-colors cursor-default hover:bg-white/[0.04]"
                                            style={{
                                                gridTemplateColumns: '1fr auto auto auto',
                                                borderBottom: '1px solid var(--glass-border)',
                                            }}
                                        >
                                            {/* Asset */}
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                <Avatar className="h-8 w-8 rounded-xl flex-shrink-0"
                                                    style={{ border: '1px solid var(--glass-border)' }}>
                                                    {/* @ts-ignore */}
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${sub.userName}&backgroundColor=7c3aed`} />
                                                    {/* @ts-ignore */}
                                                    <AvatarFallback className="rounded-xl text-[11px] font-bold">
                                                        {sub.userName.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--page-fg)' }}>
                                                        {sub.userName}
                                                    </p>
                                                    <p className="text-[10px] truncate" style={{ color: 'var(--txt-sub)' }}>
                                                        {sub.plan?.name || a.table.unknownPlan} · {intervalLabel}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Code */}
                                            <div className="px-3">
                                                <span className="text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap"
                                                    style={{ background: 'var(--glass-border)', color: 'var(--txt-sub)' }}>
                                                    {fakeCode(sub.id || sub.userName)}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="px-3">
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                                                    style={{ background: 'rgba(139,92,246,0.10)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.16)' }}>
                                                    ● {a.table.done}
                                                </span>
                                            </div>

                                            {/* Value */}
                                            <div className="text-right">
                                                <p className="text-sm font-bold tabular-nums whitespace-nowrap" style={{ color: '#10B981' }}>
                                                    +{formatCurrency(displayPrice)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
