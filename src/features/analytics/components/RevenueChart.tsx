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
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} opacity={0.3} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--txt-sub)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--txt-sub)"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}€`}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--glass-border)', opacity: 0.1 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</p>
                                                <p className="text-sm font-black text-white">
                                                    {payload[0].value?.toLocaleString()}€
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar
                                dataKey="total"
                                fill="url(#colorRevenue)"
                                radius={[6, 6, 0, 0]}
                                barSize={45}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
