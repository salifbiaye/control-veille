"use client"

import { TrendingUp, CreditCard } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useT } from "@/lib/i18n/locale-context"

interface SubGrowthData {
    date: string
    count: number
}

interface SubscriptionsActivityChartProps {
    data: SubGrowthData[]
}

export function SubscriptionsActivityChart({ data }: SubscriptionsActivityChartProps) {
    const t = useT()
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const avg = data.length > 0 ? (total / data.length).toFixed(1) : 0

    const chartConfig = {
        count: {
            label: t.nav.subscriptions,
            color: "#8B5CF6",
        },
    } satisfies ChartConfig

    return (
        <Card className="bg-[var(--card-bg)] border-[var(--glass-border)] overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[var(--page-fg)]">
                            {t.subscriptions.charts.subscriptions}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {t.subscriptions.charts.subscriptionsDesc}
                        </CardDescription>
                    </div>
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <CreditCard className="w-5 h-5 text-violet-500" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <AreaChart
                        data={data}
                        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillSub" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tick={{ fill: 'var(--txt-sub)', fontSize: 10 }}
                            tickFormatter={(value) => value}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={12}
                            tick={{ fill: 'var(--txt-sub)', fontSize: 10 }}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2 }}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="count"
                            type="monotone"
                            fill="url(#fillSub)"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            activeDot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="pt-4 pb-6 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)]">
                <div className="flex w-full items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-violet-500 font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        <span>{t.subscriptions.charts.average.replace('{val}', avg.toString())}</span>
                    </div>
                    <div className="text-muted-foreground font-medium">
                        {t.subscriptions.charts.total} <span className="text-[var(--page-fg)]">{total}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
