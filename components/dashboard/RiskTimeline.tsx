"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const URGENCY_ORDER = ["low", "medium", "high", "critical"] as const
const HIGH_THRESHOLD_INDEX = 2 // high = 2, critical = 3

function urgencyToScore(urgency: string | undefined): number {
  if (!urgency) return 0
  const i = URGENCY_ORDER.indexOf(urgency.toLowerCase() as (typeof URGENCY_ORDER)[number])
  return i >= 0 ? i : 0
}

export type MessageWithRisk = {
  id: string
  created_at: string
  metadata?: { risk?: string } | null
}

type ChartPoint = {
  time: string
  timeLabel: string
  score: number
  aboveThreshold: number
}

function buildChartData(messages: MessageWithRisk[]): ChartPoint[] {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  return sorted.map((m) => {
    const score = urgencyToScore(m.metadata?.risk)
    return {
      time: m.created_at,
      timeLabel: new Date(m.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      score,
      aboveThreshold: score >= HIGH_THRESHOLD_INDEX ? score : HIGH_THRESHOLD_INDEX,
    }
  })
}

type RiskTimelineProps = {
  messages: MessageWithRisk[]
}

export function RiskTimeline({ messages }: RiskTimelineProps) {
  const data = buildChartData(messages)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground text-sm">
        No message data to display.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="riskHighFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="timeLabel"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tickFormatter={(v) => URGENCY_ORDER[v] ?? ""}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            className="text-muted-foreground"
          />
          {/* Red area above high threshold */}
          <Area
            type="monotone"
            dataKey="aboveThreshold"
            baseValue={HIGH_THRESHOLD_INDEX}
            fill="url(#riskHighFill)"
            stroke="var(--color-destructive)"
            strokeWidth={0}
            isAnimationActive={true}
          />
          {/* Smooth risk score line */}
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={{ fill: "var(--color-chart-1)", r: 3 }}
            activeDot={{ r: 4 }}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
