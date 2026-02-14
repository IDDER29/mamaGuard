"use client";

import type { Patient } from "@/types";

interface StatsBarProps {
  /** Fetched patients array; stats are computed from this (total, critical, high, stable). */
  patients: Patient[];
}

export function StatsBar({ patients }: StatsBarProps) {
  const stats = {
    total: patients.length,
    critical: patients.filter((p) => p.risk_level === "critical").length,
    high: patients.filter((p) => p.risk_level === "high").length,
    stable: patients.filter((p) => p.risk_level === "low").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white border-b border-slate-200">
      <StatBox label="Total Managed" value={stats.total} color="text-slate-900" icon="groups" />
      <StatBox label="Critical Care" value={stats.critical} color="text-red-600" icon="emergency" />
      <StatBox label="High Monitoring" value={stats.high} color="text-orange-500" icon="priority_high" />
      <StatBox label="Stable / Low Risk" value={stats.stable} color="text-emerald-600" icon="check_circle" />
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="p-6 border-r border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}