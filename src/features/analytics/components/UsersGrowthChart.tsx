'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface GrowthLabels {
    chip: string
    title: string
    desc: string
    total: string
    peak: string
    tooltip: string
}

interface UsersGrowthChartProps {
    data: { date: string, users: number }[]
    labels?: GrowthLabels
}

const DEFAULT_LABELS: GrowthLabels = {
    chip: 'Croissance · 30J',
    title: 'Nouveaux Utilisateurs',
    desc: 'Inscriptions enregistrées quotidiennement',
    total: 'Total',
    peak: 'Pic',
    tooltip: 'utilisateurs',
}

export function UsersGrowthChart({ data, labels = DEFAULT_LABELS }: UsersGrowthChartProps) {
    const total = data.reduce((s, d) => s + (d.users || 0), 0)
    const peak = Math.max(...data.map(d => d.users || 0), 0)

    return (
        <div
            className="h-full rounded-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <div className="flex items-start justify-between">
                    <div>
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
                    <div className="flex gap-4 mt-0.5">
                        <div className="text-right">
                            <p className="text-[10px] font-medium" style={{ color: 'var(--txt-muted)' }}>{labels.total}</p>
                            <p className="text-sm font-black tabular-nums" style={{ color: 'var(--page-fg)' }}>{total}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-medium" style={{ color: 'var(--txt-muted)' }}>{labels.peak}</p>
                            <p className="text-sm font-black tabular-nums" style={{ color: '#3B82F6' }}>{peak}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 px-4 pb-4 pt-4">
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.22} />
                                    <stop offset="90%" stopColor="#3B82F6" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 6" stroke="var(--glass-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--glass-border)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={24}
                                dy={8}
                                tick={{ fill: 'var(--txt-sub)', fontWeight: 500 }}
                            />
                            <YAxis
                                stroke="var(--glass-border)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tick={{ fill: 'var(--txt-sub)' }}
                            />
                            <Tooltip
                                cursor={{ stroke: 'rgba(59,130,246,0.25)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="px-3.5 py-3 rounded-xl shadow-2xl"
                                                style={{ background: 'var(--card-bg)', border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(12px)' }}>
                                                <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#60A5FA' }}>{label}</p>
                                                <p className="text-base font-black tabular-nums" style={{ color: 'var(--page-fg)' }}>
                                                    {payload[0].value} <span className="text-xs font-normal" style={{ color: 'var(--txt-sub)' }}>{labels.tooltip}</span>
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#fillUsers)"
                                dot={false}
                                activeDot={{ r: 5, fill: '#3B82F6', stroke: 'var(--card-bg)', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
