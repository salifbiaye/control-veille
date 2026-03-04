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
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                wrapperClassName="recharts-tooltip-custom"
                                contentStyle={{ background: 'transparent', border: 'none', padding: 0 }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry, index) => <span className="text-sm text-slate-300">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
