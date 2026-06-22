"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

type VitalEntry = {
  recorded_at: string
  systolic: number | null
  diastolic: number | null
}

type ChartPoint = {
  time: string
  timeLabel: string
  systolic: number | null
  diastolic: number | null
}

function buildChartData(vitals: VitalEntry[]): ChartPoint[] {
  return [...vitals]
    .filter((v) => v.systolic != null || v.diastolic != null)
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    )
    .map((v) => ({
      time: v.recorded_at,
      timeLabel: new Date(v.recorded_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      systolic: v.systolic,
      diastolic: v.diastolic,
    }))
}

type VitalsChartProps = {
  vitals: VitalEntry[]
}

export function VitalsChart({ vitals }: VitalsChartProps) {
  const data = buildChartData(vitals)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground text-sm">
        No vitals recorded yet.
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ backgroundColor: "var(--color-chart-1)" }}
          />
          Systolic
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ backgroundColor: "var(--color-destructive)" }}
          />
          Diastolic
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="timeLabel"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[40, 200]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              className="text-muted-foreground"
            />
            {/* Pre-eclampsia thresholds */}
            <ReferenceLine
              y={140}
              stroke="var(--color-destructive)"
              strokeDasharray="4 4"
            />
            <ReferenceLine
              y={90}
              stroke="var(--color-destructive)"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ fill: "var(--color-chart-1)", r: 3 }}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="var(--color-destructive)"
              strokeWidth={2}
              dot={{ fill: "var(--color-destructive)", r: 3 }}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
