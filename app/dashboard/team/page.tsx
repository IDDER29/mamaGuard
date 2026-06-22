"use client";

/**
 * Supervisor Team Overview — Plan E4.4
 *
 * Caseload + SLA-load monitoring for supervisors/admins. Shows each team
 * member's patient caseload and open-alert load so supervisors can spot
 * overloaded or unutilized staff. Reassignment itself happens from a
 * patient's detail page (not built here).
 *
 * Lint rule: no synchronous setState in a useEffect body — data loads in an
 * inline async IIFE, setState only after await, with an `active` guard.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  ClipboardList,
  Siren,
  UserMinus,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import { getCurrentProfile } from "@/app/actions/profiles";
import { listTeam, type TeamMember } from "@/app/actions/team";
import { ROLE_LABELS, type Role } from "@/lib/roles";

const CARD_CLASS =
  "rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm";

const HIGH_ALERT_THRESHOLD = 3;

function roleLabel(role: string): string {
  return ROLE_LABELS[role as Role] ?? role;
}

export default function TeamPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await getCurrentProfile();
      const canSupervise = me.role === "supervisor" || me.role === "admin";
      if (!canSupervise) {
        if (!active) return;
        setAllowed(false);
        setLoading(false);
        return;
      }
      const data = await listTeam();
      if (!active) return;
      setAllowed(true);
      setTeam(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const data = await listTeam();
    setTeam(data);
    setRefreshing(false);
  }, []);

  const stats = useMemo(() => {
    let patients = 0;
    let alerts = 0;
    let unutilized = 0;
    for (const m of team) {
      patients += m.patient_count;
      alerts += m.open_alerts;
      if (m.patient_count === 0) unutilized += 1;
    }
    return {
      teamSize: team.length,
      patients,
      alerts,
      unutilized,
    };
  }, [team]);

  const sortedTeam = useMemo(() => {
    return [...team].sort((a, b) => {
      if (b.open_alerts !== a.open_alerts) return b.open_alerts - a.open_alerts;
      return b.patient_count - a.patient_count;
    });
  }, [team]);

  // Access gate: supervisors only.
  if (allowed === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
        <div className="container mx-auto flex min-h-[60vh] max-w-[1000px] items-center justify-center px-4 py-6 sm:px-6">
          <div className={`${CARD_CLASS} flex flex-col items-center px-8 py-12 text-center`}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
              <ShieldAlert className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Supervisors only</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              This team overview is restricted to supervisors and administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
              <Users className="h-7 w-7 text-primary" />
              Team Overview
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Caseload &amp; SLA-load monitoring across your team — patient
              assignments and open-alert load per member. Reassign work from a
              patient&apos;s detail page.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <TeamSkeleton />
        ) : (
          <>
            {/* KPI stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Team size"
                value={stats.teamSize}
                icon={<Users className="h-5 w-5" />}
                accent="text-sky-600 bg-sky-50"
              />
              <StatCard
                label="Assigned patients"
                value={stats.patients}
                icon={<ClipboardList className="h-5 w-5" />}
                accent="text-emerald-600 bg-emerald-50"
              />
              <StatCard
                label="Open alerts"
                value={stats.alerts}
                icon={<Siren className="h-5 w-5" />}
                accent="text-rose-600 bg-rose-50"
              />
              <StatCard
                label="Unutilized members"
                value={stats.unutilized}
                icon={<UserMinus className="h-5 w-5" />}
                accent="text-amber-600 bg-amber-50"
              />
            </div>

            {/* Team table */}
            <div className={`${CARD_CLASS} mt-6 overflow-hidden`}>
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Members</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Sorted by open alerts, then caseload. Rows flagged amber carry
                  a heavy alert load (≥{HIGH_ALERT_THRESHOLD}).
                </p>
              </div>

              {sortedTeam.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <Users className="h-10 w-10 text-slate-300" />
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    No team members yet
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Once clinicians and community health workers have profiles,
                    they will appear here with their caseloads.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3">Member</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Region</th>
                        <th className="px-6 py-3 text-right">Caseload</th>
                        <th className="px-6 py-3 text-right">Open alerts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedTeam.map((m) => {
                        const heavy = m.open_alerts >= HIGH_ALERT_THRESHOLD;
                        return (
                          <tr
                            key={m.id}
                            className={heavy ? "bg-amber-50/60" : "hover:bg-slate-50/60"}
                          >
                            <td className="px-6 py-3">
                              <span
                                className={`font-medium ${m.full_name ? "text-slate-900" : "italic text-slate-400"}`}
                              >
                                {m.full_name || "Unassigned profile"}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                {roleLabel(m.role)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-slate-600">
                              {m.region || "—"}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-700">
                              {m.patient_count}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span
                                className={`inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                                  heavy
                                    ? "bg-amber-100 text-amber-800"
                                    : m.open_alerts > 0
                                      ? "bg-slate-100 text-slate-700"
                                      : "text-slate-400"
                                }`}
                              >
                                {m.open_alerts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
    <div className={`${CARD_CLASS} p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
        ))}
      </div>
      <div className="mt-6 h-80 rounded-2xl bg-slate-100 ring-1 ring-slate-200/70" />
    </div>
  );
}
