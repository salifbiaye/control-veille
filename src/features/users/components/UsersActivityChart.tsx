"use client"

import { TrendingUp, Users } from "lucide-react"
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

interface UserGrowthData {
  date: string
  users: number
}

interface UsersActivityChartProps {
  data: UserGrowthData[]
}

export function UsersActivityChart({ data }: UsersActivityChartProps) {
  const t = useT()
  const total = data.reduce((sum, item) => sum + item.users, 0)
  const avg = data.length > 0 ? (total / data.length).toFixed(1) : 0

  const chartConfig = {
    users: {
      label: t.users.tabs.clients,
      color: "#3B82F6",
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--glass-border)] overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[var(--page-fg)]">
              {t.users.charts.registrations}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t.users.charts.registrationsDesc}
            </CardDescription>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Users className="w-5 h-5 text-primary" />
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
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: 'var(--txt-sub)', fontSize: 10 }}
              tickFormatter={(value) => value} // "DD/MM" is already formatted
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: 'var(--txt-sub)', fontSize: 10 }}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="users"
              type="monotone"
              fill="url(#fillUsers)"
              stroke="#3B82F6"
              strokeWidth={2}
              activeDot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-4 pb-6 border-t border-[var(--glass-border)] bg-[rgba(255,255,255,0.01)]">
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <TrendingUp className="h-4 w-4" />
            <span>{t.users.charts.average.replace('{val}', avg.toString())}</span>
          </div>
          <div className="text-muted-foreground font-medium">
            {t.users.charts.total} <span className="text-[var(--page-fg)]">{total}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
