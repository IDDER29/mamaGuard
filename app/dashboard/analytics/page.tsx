"use client";

/**
 * Analytics & Reporting Page
 *
 * Clinician-facing analytics dashboard for MamaGuard, surfacing
 * WHO Antenatal Care (ANC) programme indicators derived from the live
 * patient cohort, plus a facility/government CSV export.
 *
 * Data: real Supabase patients via usePatientData(). All metrics are
 * derived with useMemo (no effects → lint-clean per the repo's
 * "no setState in useEffect" rule).
 */

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  Baby,
  Download,
  Users,
} from "lucide-react";

import { usePatientData } from "../patients/hooks";
import type { Patient } from "@/types";

type RiskLevel = Patient["risk_level"];

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#10b981", // emerald
  medium: "#f59e0b", // amber
  high: "#f97316", // orange
  critical: "#f43f5e", // rose
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const CARD_CLASS =
  "rounded-2xl ring-1 ring-slate-200/70 shadow-sm bg-white p-6";

type TrimesterBucket = {
  label: string;
  count: number;
};

function trimesterFromWeek(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

export default function AnalyticsPage() {
  const { patients, loading } = usePatientData();

  const metrics = useMemo(() => {
    const total = patients.length;

    const riskDistribution: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const channelDistribution: Record<string, number> = {};

    const trimesterCounts: Record<1 | 2 | 3, number> = { 1: 0, 2: 0, 3: 0 };
    let postpartumCount = 0;

    for (const p of patients) {
      if (RISK_LEVELS.includes(p.risk_level)) {
        riskDistribution[p.risk_level] += 1;
      }

      const channel = p.preferred_channel || "unknown";
      channelDistribution[channel] = (channelDistribution[channel] ?? 0) + 1;

      if (p.postpartum) {
        postpartumCount += 1;
      } else {
        const week = Number.isFinite(p.gestational_week)
          ? p.gestational_week
          : 0;
        trimesterCounts[trimesterFromWeek(week)] += 1;
      }
    }

    const highCriticalCount =
      riskDistribution.high + riskDistribution.critical;

    const riskChartData = RISK_LEVELS.filter(
      (level) => riskDistribution[level] > 0,
    ).map((level) => ({
      level,
      name: RISK_LABELS[level],
      value: riskDistribution[level],
      color: RISK_COLORS[level],
    }));

    const trimesterChartData: TrimesterBucket[] = [
      { label: "1st trimester", count: trimesterCounts[1] },
      { label: "2nd trimester", count: trimesterCounts[2] },
      { label: "3rd trimester", count: trimesterCounts[3] },
      { label: "Postpartum", count: postpartumCount },
    ];

    const channelChartData = Object.entries(channelDistribution)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      riskDistribution,
      highCriticalCount,
      postpartumCount,
      riskChartData,
      trimesterChartData,
      channelChartData,
    };
  }, [patients]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Analytics &amp; Reporting
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Cohort indicators aligned with the WHO Antenatal Care (ANC)
              programme — risk stratification, gestational distribution, and
              delivery-channel reach across your facility.
            </p>
          </div>
          <a
            href="/api/reports/export"
            download="mamaguard-patients.csv"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-slate-900/10 transition hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Export report (CSV)
          </a>
        </div>

        {loading ? (
          <AnalyticsSkeleton />
        ) : metrics.total === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* KPI stat cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total patients"
                value={metrics.total}
                icon={<Users className="h-5 w-5" />}
                accent="text-sky-600 bg-sky-50"
              />
              <StatCard
                label="High & critical risk"
                value={metrics.highCriticalCount}
                icon={<AlertTriangle className="h-5 w-5" />}
                accent="text-rose-600 bg-rose-50"
              />
              <StatCard
                label="Postpartum"
                value={metrics.postpartumCount}
                icon={<Baby className="h-5 w-5" />}
                accent="text-violet-600 bg-violet-50"
              />
              <StatCard
                label="Active monitoring"
                value={metrics.total - metrics.postpartumCount}
                icon={<Activity className="h-5 w-5" />}
                accent="text-emerald-600 bg-emerald-50"
              />
            </div>

            {/* Charts */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Risk distribution pie */}
              <div className={CARD_CLASS}>
                <h2 className="text-sm font-semibold text-slate-900">
                  Risk distribution
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Patients by triage urgency level.
                </p>
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.riskChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {metrics.riskChartData.map((entry) => (
                          <Cell key={entry.level} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid rgb(226 232 240)",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trimester bar */}
              <div className={CARD_CLASS}>
                <h2 className="text-sm font-semibold text-slate-900">
                  Patients by stage
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Gestational trimester &amp; postpartum cohort.
                </p>
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.trimesterChartData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgb(226 232 240)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "rgb(100 116 139)" }}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <Tooltip
                        cursor={{ fill: "rgb(241 245 249)" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid rgb(226 232 240)",
                          fontSize: 12,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Patients"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Channel distribution */}
            <div className={`${CARD_CLASS} mt-6`}>
              <h2 className="text-sm font-semibold text-slate-900">
                Delivery-channel reach
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                How patients receive monitoring messages.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {metrics.channelChartData.map((c) => (
                  <div
                    key={c.channel}
                    className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70"
                  >
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {c.channel}
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">
                      {c.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={`${CARD_CLASS} mt-8 flex flex-col items-center justify-center py-16 text-center`}>
      <Users className="h-10 w-10 text-slate-300" />
      <h2 className="mt-4 text-base font-semibold text-slate-900">
        No patient data yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Once patients are registered, cohort analytics and WHO ANC indicators
        will appear here.
      </p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
        <div className="h-80 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
      </div>
    </div>
  );
}
