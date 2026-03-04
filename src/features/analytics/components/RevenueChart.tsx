'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface RevenueChartProps {
    data: { name: string, total: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <Card className="col-span-4 bg-[var(--card-bg)] border-[var(--glass-border)] shadow-sm">
            <CardHeader>
                <CardTitle className="text-white">Aperçu MRR (6 mois)</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Revenus récurrents mensuels cumulés.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}€`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                wrapperClassName="recharts-tooltip-custom"
                                contentStyle={{ background: 'transparent', border: 'none', padding: 0 }}
                                itemStyle={{ color: '#c4b5fd' }}
                                formatter={(value: any) => [`${value.toFixed(2)}€`, 'Revenus'] as any}
                            />
                            <Bar
                                dataKey="total"
                                fill="url(#colorRevenue)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
