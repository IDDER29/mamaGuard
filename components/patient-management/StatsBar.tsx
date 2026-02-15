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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 bg-white overflow-x-auto">
      <StatBox label="Total Patients" value={stats.total} color="text-slate-900" bgColor="bg-slate-100/80" icon="groups" />
      <StatBox label="Critical Care" value={stats.critical} color="text-rose-600" bgColor="bg-rose-50" icon="emergency" />
      <StatBox label="High Risk" value={stats.high} color="text-orange-600" bgColor="bg-orange-50" icon="priority_high" />
      <StatBox label="Stable" value={stats.stable} color="text-emerald-600" bgColor="bg-emerald-50" icon="check_circle" />
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  bgColor,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  icon: string;
}) {
  return (
    <div className="group p-4 md:p-5 border-r border-slate-200/60 last:border-r-0 flex items-center gap-3 min-w-[160px] hover:bg-slate-50/50 transition-colors duration-200">
      <div className={`flex-shrink-0 p-2.5 rounded-xl ${bgColor} ${color} transition-transform duration-200 group-hover:scale-105`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
      </div>
    </div>
  );
}