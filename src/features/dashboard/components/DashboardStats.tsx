import Link from 'next/link'
import { Users, Database, BarChart3, Activity } from 'lucide-react'

interface DashboardStatsProps {
    stats: {
        users: { total: number }
        techWatches: { total: number }
        content: { articles: number }
        tasks: { total: number }
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const statsCards = [
        {
            title: "Utilisateurs Clients",
            value: stats.users.total.toString(),
            href: "/dashboard/users",
            icon: Users,
            color: "#3B82F6", // blue
        },
        {
            title: "TechWatches",
            value: stats.techWatches.total.toString(),
            href: "/dashboard/techwatches",
            icon: Database,
            color: "#10B981", // green
        },
        {
            title: "Articles Indexés",
            value: stats.content.articles.toLocaleString(),
            href: "/dashboard/analytics",
            icon: BarChart3,
            color: "var(--brand)", // violet
        },
        {
            title: "Tâches Globales",
            value: stats.tasks.total.toString(),
            href: "/dashboard/analytics",
            icon: Activity,
            color: "#F59E0B", // amber
        }
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 lg:mb-10">
            {statsCards.map((stat, i) => (
                <Link
                    key={i}
                    href={stat.href}
                    className="relative overflow-hidden p-4 rounded-2xl border transition-all hover:-translate-y-0.5 flex flex-col gap-3 animate-scale-in"
                    style={{
                        animationDelay: `${i * 100}ms`,
                        background: 'var(--glass-bg)',
                        borderColor: 'var(--glass-border)',
                    }}
                >
                    {/* Icon */}
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `color-mix(in srgb, ${stat.color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${stat.color} 19%, transparent)` }}
                    >
                        <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>

                    {/* Value + label */}
                    <div>
                        <p className="text-3xl font-black tabular-nums leading-none" style={{ color: stat.color }}>
                            {stat.value}
                        </p>
                        <p className="text-[11px] font-semibold uppercase tracking-wide mt-1" style={{ color: 'var(--txt-muted)' }}>
                            {stat.title}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    )
}
