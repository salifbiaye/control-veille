'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Users, TrendingUp } from 'lucide-react'

interface DashboardGrowthChartsProps {
    usersGrowth: any[]
    revenueData: any[]
}

const usersChartConfig = {
    users: {
        label: "Utilisateurs",
        color: "#3b82f6",
    },
} satisfies ChartConfig

const revenueChartConfig = {
    total: {
        label: "MRR",
        color: "#8b5cf6",
    },
} satisfies ChartConfig

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
                    <ChartContainer config={usersChartConfig} className="h-[240px] w-full mt-4">
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
                                tickLine={false}
                                axisLine={false}
                                fontSize={10}
                                minTickGap={20}
                                tick={{ fill: 'rgba(255,255,255,0.4)' }}
                            />
                            <ChartTooltip
                                cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 1 }}
                                content={<ChartTooltipContent />}
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
                    </ChartContainer>
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
                    <ChartContainer config={revenueChartConfig} className="h-[240px] w-full mt-4">
                        <BarChart data={revenueData} barCategoryGap="30%">
                            <defs>
                                <linearGradient id="barMRR" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#4c1d95" stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                fontSize={10}
                                tick={{ fill: 'rgba(255,255,255,0.4)' }}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(139,92,246,0.08)', radius: 6 }}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => [
                                            `${Number(value).toFixed(2)}€`,
                                            'MRR',
                                        ]}
                                    />
                                }
                            />
                            <Bar
                                dataKey="total"
                                fill="url(#barMRR)"
                                radius={[6, 6, 2, 2]}
                                maxBarSize={48}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
