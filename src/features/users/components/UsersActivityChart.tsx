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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useT } from "@/lib/i18n/locale-context"

interface UserGrowthData {
  date: string
  USER?: number
  ADMIN?: number
  SUPER_ADMIN?: number
  SUPPORT?: number
  READ_ONLY?: number
}

interface UsersActivityChartProps {
  data: UserGrowthData[]
  title?: string
  description?: string
}

const ROLE_CONFIG = [
  { key: 'USER', color: '#3B82F6', label: 'Clients' },
  { key: 'ADMIN', color: '#F59E0B', label: 'Admins' },
  { key: 'SUPER_ADMIN', color: '#EF4444', label: 'Super' },
  { key: 'SUPPORT', color: '#8B5CF6', label: 'Support' },
  { key: 'READ_ONLY', color: '#64748B', label: 'Lecteurs' },
]

export function UsersActivityChart({ data, title, description }: UsersActivityChartProps) {
  const t = useT()

  // Calculate total registrations across all roles for summary
  const total = data.reduce((sum, item) => {
    return sum + (item.USER || 0) + (item.ADMIN || 0) + (item.SUPER_ADMIN || 0) + (item.SUPPORT || 0) + (item.READ_ONLY || 0)
  }, 0)

  const avg = data.length > 0 ? (total / data.length).toFixed(1) : 0

  const chartConfig = {
    USER: { label: 'Client', color: "#3B82F6" },
    ADMIN: { label: 'Admin', color: "#F59E0B" },
    SUPER_ADMIN: { label: 'Super Admin', color: "#EF4444" },
    SUPPORT: { label: 'Support', color: "#8B5CF6" },
    READ_ONLY: { label: 'Lecture Seule', color: "#64748B" },
  } satisfies ChartConfig

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--glass-border)] overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[var(--page-fg)]">
              {title || t.users.charts.registrations}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {description || t.users.charts.registrationsDesc}
            </CardDescription>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={data}
            margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
          >
            <defs>
              {ROLE_CONFIG.map(role => (
                <linearGradient key={`fill${role.key}`} id={`fill${role.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={role.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={role.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: 'var(--txt-sub)', fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: 'var(--txt-sub)', fontSize: 10 }}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {ROLE_CONFIG.map(role => (
              <Area
                key={role.key}
                dataKey={role.key}
                name={role.label}
                type="monotone"
                fill={`url(#fill${role.key})`}
                stroke={role.color}
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0 }}
                stackId="1"
              />
            ))}
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
