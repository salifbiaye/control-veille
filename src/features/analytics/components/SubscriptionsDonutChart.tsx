'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface SubscriptionsDonutChartProps {
    data: { name: string, value: number }[]
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#64748B']

export function SubscriptionsDonutChart({ data }: SubscriptionsDonutChartProps) {
    return (
        <Card className="col-span-3 bg-[var(--card-bg)] border-[var(--glass-border)] shadow-sm">
            <CardHeader>
                <CardTitle className="text-white">Répartition des Plans</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Abonnements actifs par niveau de service.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="rgba(255,255,255,0.05)"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="var(--glass-border)"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                                <p className="text-xs font-bold text-white mb-1">{payload[0].name}</p>
                                                <p className="text-sm font-black" style={{ color: payload[0].payload.fill }}>
                                                    {payload[0].value} abonnés
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
