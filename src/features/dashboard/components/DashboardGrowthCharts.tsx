'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts"
import { Users, TrendingUp } from 'lucide-react'

interface DashboardGrowthChartsProps {
    usersGrowth: any[]
    revenueData: any[]
}

export function DashboardGrowthCharts({ usersGrowth, revenueData }: DashboardGrowthChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* User Growth Chart */}
            <Card className="bg-[var(--card-bg)] border-[var(--glass-border)] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Nouveaux Utilisateurs
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Inscriptions des 30 derniers jours
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[240px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usersGrowth}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={20}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Revenue / MRR Chart */}
            <Card className="bg-[var(--card-bg)] border-[var(--glass-border)] shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-violet-400" />
                            Évolution du MRR
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Revenus récurrents cumulés (6 mois)
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[240px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}€`}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#8b5cf6' }}
                                    formatter={(val: number | undefined) => [val ? `${val.toFixed(2)}€` : '0€', 'MRR']}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
