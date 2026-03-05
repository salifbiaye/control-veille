'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface UsersGrowthChartProps {
    data: { date: string, users: number }[]
}

export function UsersGrowthChart({ data }: UsersGrowthChartProps) {
    return (
        <Card className="col-span-full bg-[var(--card-bg)] border-[var(--glass-border)] shadow-sm">
            <CardHeader>
                <CardTitle className="text-white">Croissance Utilisateurs (30 Jours)</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Nouvelles inscriptions enregistrées quotidiennement.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--txt-sub)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={20}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--txt-sub)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</p>
                                                <p className="text-sm font-black text-white">
                                                    {payload[0].value} utilisateurs
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
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
