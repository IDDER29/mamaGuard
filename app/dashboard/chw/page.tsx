"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Siren, CalendarClock, RefreshCw, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Plan 4.1 — community health worker / nurse worklist ("due list"): the tasks
// needing frontline action — active danger-sign alerts and overdue ANC visits.

interface AlertTask {
  id: string;
  patient_id: string;
  urgency: string;
  symptom_name: string | null;
  created_at: string;
  patients?: { full_name: string | null; name: string | null } | null;
}
interface VisitTask {
  id: string;
  patient_id: string;
  scheduled_at: string;
  location: string | null;
  patients?: { full_name: string | null; name: string | null } | null;
}

function patientName(p?: { full_name: string | null; name: string | null } | null): string {
  return p?.full_name || p?.name || "Unknown patient";
}

export default function ChwWorklistPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertTask[]>([]);
  const [visits, setVisits] = useState<VisitTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const [{ data: a }, { data: v }] = await Promise.all([
      supabase
        .from("alerts")
        .select("id, patient_id, urgency, symptom_name, created_at, patients(full_name, name)")
        .in("status", ["active", "acknowledged"])
        .order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("id, patient_id, scheduled_at, location, patients(full_name, name)")
        .in("status", ["scheduled", "confirmed"])
        .lt("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true }),
    ]);
    setAlerts((a ?? []) as unknown as AlertTask[]);
    setVisits((v ?? []) as unknown as VisitTask[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    (async () => {
      const [{ data: a }, { data: v }] = await Promise.all([
        supabase
          .from("alerts")
          .select("id, patient_id, urgency, symptom_name, created_at, patients(full_name, name)")
          .in("status", ["active", "acknowledged"])
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select("id, patient_id, scheduled_at, location, patients(full_name, name)")
          .in("status", ["scheduled", "confirmed"])
          .lt("scheduled_at", nowIso)
          .order("scheduled_at", { ascending: true }),
      ]);
      if (!active) return;
      setAlerts((a ?? []) as unknown as AlertTask[]);
      setVisits((v ?? []) as unknown as VisitTask[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const total = alerts.length + visits.length;

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
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
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
            <p className="text-sm text-slate-600">No outstanding alerts or overdue visits.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Siren className="h-4 w-4 text-rose-500" /> Alerts ({alerts.length})
              </h2>
              <div className="space-y-2">
                {alerts.length === 0 && <p className="text-sm text-slate-500">None.</p>}
                {alerts.map((a) => (
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
                <CalendarClock className="h-4 w-4 text-amber-500" /> Overdue visits ({visits.length})
              </h2>
              <div className="space-y-2">
                {visits.length === 0 && <p className="text-sm text-slate-500">None.</p>}
                {visits.map((v) => (
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
