"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Siren, CalendarClock, RefreshCw, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { listWorklist, type DashboardAlert, type WorklistVisit } from "@/app/actions/dashboard";

// Plan 4.1 — community health worker / nurse worklist ("due list"): the tasks
// needing frontline action — active danger-sign alerts and overdue ANC visits.
// Admin-backed reads work in demo + authenticated mode. "Mine" filters to the
// patients assigned to the signed-in worker (patients.assigned_chw).

function patientName(p: { full_name: string | null; name: string | null } | null): string {
  return p?.full_name || p?.name || "Unknown patient";
}

export default function ChwWorklistPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [visits, setVisits] = useState<WorklistVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [chwId, setChwId] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const { alerts: a, visits: v } = await listWorklist();
    setAlerts(a);
    setVisits(v);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    (async () => {
      const [{ data: userData }, work] = await Promise.all([
        supabase.auth.getUser(),
        listWorklist(),
      ]);
      if (!active) return;
      setChwId(userData.user?.id ?? null);
      setAlerts(work.alerts);
      setVisits(work.visits);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const mine = (chw: string | null | undefined) => !mineOnly || (chwId != null && chw === chwId);
  const shownAlerts = alerts.filter((a) => mine(a.patients?.assigned_chw));
  const shownVisits = visits.filter((v) => mine(v.patients?.assigned_chw));
  const total = shownAlerts.length + shownVisits.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-[1000px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ClipboardList className="h-7 w-7 text-primary" />
              My Worklist
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tasks needing action — danger-sign alerts and overdue antenatal visits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
              <button
                onClick={() => setMineOnly(false)}
                className={`px-3 py-1.5 rounded-md font-medium ${!mineOnly ? "bg-primary text-white" : "text-slate-600"}`}
              >
                All
              </button>
              <button
                onClick={() => setMineOnly(true)}
                disabled={!chwId}
                title={chwId ? "Patients assigned to me" : "Sign in to filter to your patients"}
                className={`px-3 py-1.5 rounded-md font-medium disabled:opacity-40 ${mineOnly ? "bg-primary text-white" : "text-slate-600"}`}
              >
                Mine
              </button>
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Worklist clear</h3>
            <p className="text-sm text-slate-600">
              {mineOnly ? "No tasks assigned to you." : "No outstanding alerts or overdue visits."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Siren className="h-4 w-4 text-rose-500" /> Alerts ({shownAlerts.length})
              </h2>
              <div className="space-y-2">
                {shownAlerts.length === 0 && <p className="text-sm text-slate-500">None.</p>}
                {shownAlerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => router.push(`/dashboard/patients/${a.patient_id}`)}
                    className="w-full text-left rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-sm hover:ring-primary/30 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{patientName(a.patients)}</p>
                      <p className="text-sm text-slate-600 truncate">{a.symptom_name || "Danger sign"}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${a.urgency === "critical" ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}>
                      {a.urgency}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-amber-500" /> Overdue visits ({shownVisits.length})
              </h2>
              <div className="space-y-2">
                {shownVisits.length === 0 && <p className="text-sm text-slate-500">None.</p>}
                {shownVisits.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => router.push(`/dashboard/patients/${v.patient_id}`)}
                    className="w-full text-left rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-sm hover:ring-primary/30 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{patientName(v.patients)}</p>
                      <p className="text-sm text-slate-600 truncate">{v.location || "ANC visit"}</p>
                    </div>
                    <span className="shrink-0 text-xs text-amber-700 font-medium">
                      {new Date(v.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
