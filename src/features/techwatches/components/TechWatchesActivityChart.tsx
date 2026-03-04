"use client"

import { TrendingUp, Database } from "lucide-react"
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

interface TWGrowthData {
    date: string
    count: number
}

interface TechWatchesActivityChartProps {
    data: TWGrowthData[]
}

export function TechWatchesActivityChart({ data }: TechWatchesActivityChartProps) {
    const t = useT()
    const total = data.reduce((sum, item) => sum + item.count, 0)
    const avg = data.length > 0 ? (total / data.length).toFixed(1) : 0

    const chartConfig = {
        count: {
            label: t.nav.techwatches,
            color: "#10B981",
        },
    } satisfies ChartConfig

    return (
        <Card className="bg-[var(--card-bg)] border-[var(--glass-border)] overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-[var(--page-fg)]">
                            {t.techwatches.charts?.title || "Croissance des TechWatches"}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {t.techwatches.charts?.description || "Nouvelles veilles créées sur les 30 derniers jours"}
                        </CardDescription>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <Database className="w-5 h-5 text-emerald-500" />
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
                            <linearGradient id="fillTW" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                            cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 2 }}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="count"
                            type="monotone"
                            fill="url(#fillTW)"
                            stroke="#10B981"
                            strokeWidth={2}
                            activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="pt-4 pb-6 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)]">
                <div className="flex w-full items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        <span>Moyenne de {avg} / jour</span>
                    </div>
                    <div className="text-muted-foreground font-medium">
                        Total 30j : <span className="text-[var(--page-fg)]">{total}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
