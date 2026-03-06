'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface DonutLabels {
    chip: string
    title: string
    desc: string
    center: string
    tooltip: string
    pct: string
}

interface SubscriptionsDonutChartProps {
    data: { name: string, value: number }[]
    labels?: DonutLabels
}

const DEFAULT_LABELS: DonutLabels = {
    chip: 'Plans · Actifs',
    title: 'Répartition des Plans',
    desc: 'Abonnements actifs par niveau de service',
    center: 'Actifs',
    tooltip: 'abonnés',
    pct: 'du total',
}

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#64748B']

export function SubscriptionsDonutChart({ data, labels = DEFAULT_LABELS }: SubscriptionsDonutChartProps) {
    const total = data.reduce((s, d) => s + d.value, 0)

    return (
        <div
            className="h-full rounded-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-md"
                        style={{ background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }}>
                        {labels.chip}
                    </span>
                </div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--page-fg)' }}>{labels.title}</h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--txt-sub)' }}>
                    {labels.desc}
                </p>
            </div>

            {/* Chart + Legend */}
            <div className="flex-1 flex flex-col items-center px-4 pb-5 pt-4 gap-4">
                {/* Donut */}
                <div className="relative w-full" style={{ height: 195 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={58}
                                outerRadius={86}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="transparent"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const idx = data.findIndex(d => d.name === payload[0].name)
                                        const color = COLORS[idx % COLORS.length]
                                        const pct = total > 0 ? ((Number(payload[0].value) / total) * 100).toFixed(1) : '0'
                                        return (
                                            <div className="px-3.5 py-3 rounded-xl shadow-2xl"
                                                style={{ background: 'var(--card-bg)', border: `1px solid ${color}35`, backdropFilter: 'blur(12px)' }}>
                                                <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--txt-sub)' }}>{payload[0].name}</p>
                                                <p className="text-base font-black" style={{ color }}>{payload[0].value} {labels.tooltip}</p>
                                                <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-muted)' }}>{pct}% {labels.pct}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black tabular-nums leading-none" style={{ color: 'var(--page-fg)' }}>{total}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: 'var(--txt-sub)' }}>{labels.center}</span>
                    </div>
                </div>

                {/* Legend list */}
                <div className="w-full space-y-2">
                    {data.map((entry, index) => {
                        const color = COLORS[index % COLORS.length]
                        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0'
                        return (
                            <div key={entry.name} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                <span className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--txt-sub)' }}>{entry.name}</span>
                                <div className="w-16 h-1 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--glass-border)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${(entry.value / Math.max(total, 1)) * 100}%`, background: color, opacity: 0.8 }} />
                                </div>
                                <span className="text-xs font-bold tabular-nums w-9 text-right flex-shrink-0" style={{ color }}>{pct}%</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
