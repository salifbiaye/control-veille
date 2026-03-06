'use client'

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface RevenueLabels {
    chip: string
    title: string
    desc: string
    avg: string
}

interface RevenueChartProps {
    data: { name: string, total: number }[]
    labels?: RevenueLabels
}

const DEFAULT_LABELS: RevenueLabels = {
    chip: 'MRR · 6 MOIS',
    title: 'Aperçu des Revenus',
    desc: 'Revenus récurrents mensuels cumulés',
    avg: 'moy.',
}

export function RevenueChart({ data, labels = DEFAULT_LABELS }: RevenueChartProps) {
    const avg = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.total, 0) / data.length) : 0
    const first = data[0]?.total ?? 0
    const last = data[data.length - 1]?.total ?? 0
    const trend = first > 0 ? Math.round(((last - first) / first) * 100) : 0
    const trendPositive = trend >= 0

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
                                style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA' }}>
                                {labels.chip}
                            </span>
                        </div>
                        <h3 className="text-[15px] font-bold" style={{ color: 'var(--page-fg)' }}>{labels.title}</h3>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--txt-sub)' }}>
                            {labels.desc}
                        </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg mt-0.5"
                        style={trendPositive
                            ? { background: 'rgba(16,185,129,0.10)', color: '#10B981', border: '1px solid rgba(16,185,129,0.16)' }
                            : { background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.16)' }
                        }>
                        {trendPositive ? '+' : ''}{trend}%
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 px-4 pb-4 pt-4">
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                            <defs>
                                <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#4C1D95" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 6" stroke="var(--glass-border)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--glass-border)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                dy={8}
                                tick={{ fill: 'var(--txt-sub)', fontWeight: 500 }}
                            />
                            <YAxis
                                stroke="var(--glass-border)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`}
                                tick={{ fill: 'var(--txt-sub)' }}
                            />
                            {avg > 0 && (
                                <ReferenceLine
                                    y={avg}
                                    stroke="rgba(167,139,250,0.3)"
                                    strokeDasharray="4 4"
                                    label={{ value: labels.avg, position: 'insideTopRight', fill: '#A78BFA', fontSize: 10, fontWeight: 600 }}
                                />
                            )}
                            <Tooltip
                                cursor={{ fill: 'var(--glass-border)', radius: 6 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const val = Number(payload[0].value) || 0
                                        return (
                                            <div className="px-3.5 py-3 rounded-xl shadow-2xl"
                                                style={{ background: 'var(--card-bg)', border: '1px solid rgba(139,92,246,0.2)', backdropFilter: 'blur(12px)' }}>
                                                <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: '#A78BFA' }}>{label}</p>
                                                <p className="text-base font-black tabular-nums" style={{ color: 'var(--page-fg)' }}>
                                                    {val >= 1000 ? `${(val / 100).toFixed(2)}€` : `${val}€`}
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="total" fill="url(#barRevenue)" radius={[6, 6, 2, 2]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
