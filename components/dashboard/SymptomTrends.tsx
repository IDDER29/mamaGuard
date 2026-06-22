"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

export type SymptomMessage = {
  created_at: string
  metadata?: { risk?: string; triage_signs?: string[] } | null
}

type SignDatum = {
  label: string
  count: number
}

function signIdToLabel(id: string): string {
  const spaced = id.replace(/_/g, " ").trim()
  if (spaced.length === 0) return spaced
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function buildSignData(messages: SymptomMessage[]): {
  data: SignDatum[]
  flaggedMessages: number
} {
  const counts = new Map<string, number>()
  let flaggedMessages = 0

  for (const message of messages) {
    const signs = message.metadata?.triage_signs
    if (!Array.isArray(signs) || signs.length === 0) continue
    flaggedMessages += 1
    for (const sign of signs) {
      if (typeof sign !== "string" || sign.length === 0) continue
      counts.set(sign, (counts.get(sign) ?? 0) + 1)
    }
  }

  const data: SignDatum[] = Array.from(counts.entries())
    .map(([id, count]) => ({ label: signIdToLabel(id), count }))
    .sort((a, b) => b.count - a.count)

  return { data, flaggedMessages }
}

type SymptomTrendsProps = {
  messages: SymptomMessage[]
}

export function SymptomTrends({ messages }: SymptomTrendsProps) {
  const { data, flaggedMessages } = buildSignData(messages)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground text-sm">
        No symptom data yet.
      </div>
    )
  }

  const topData = data.slice(0, 8)
  const mostFrequent = data[0]

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        {flaggedMessages} flagged {flaggedMessages === 1 ? "message" : "messages"}
        {" · most frequent: "}
        <span className="font-medium text-foreground">{mostFrequent.label}</span>
        {` (${mostFrequent.count})`}
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topData}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <Bar
              dataKey="count"
              fill="var(--color-chart-1)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
