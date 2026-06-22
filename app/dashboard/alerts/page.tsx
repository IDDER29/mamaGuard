"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Siren,
  TriangleAlert,
  Check,
  CircleCheck,
  Clock,
  Phone,
  RefreshCw,
  Inbox,
  Ambulance,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { acknowledgeAlert, resolveAlert } from "@/app/actions/alerts";
import { createReferral } from "@/app/actions/referrals";
import { listActiveAlerts } from "@/app/actions/dashboard";
import { useToast } from "@/hooks/use-toast";

interface AlertRow {
  id: string;
  patient_id: string;
  urgency: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  symptom_name: string | null;
  created_at: string;
  escalation_level?: number;
  owner_name?: string | null;
  patients?: { full_name: string | null; name: string | null; phone_number: string | null } | null;
}

const URGENCY = {
  critical: { ring: "ring-rose-200", chip: "bg-rose-50 text-rose-700", Icon: Siren, dot: "bg-rose-500" },
  high: { ring: "ring-orange-200", chip: "bg-orange-50 text-orange-700", Icon: TriangleAlert, dot: "bg-orange-500" },
  medium: { ring: "ring-amber-200", chip: "bg-amber-50 text-amber-700", Icon: TriangleAlert, dot: "bg-amber-500" },
  low: { ring: "ring-slate-200", chip: "bg-slate-100 text-slate-600", Icon: TriangleAlert, dot: "bg-slate-400" },
} as const;

// SLA response targets (minutes) for the act-now queue.
const SLA_MINUTES: Record<string, number> = { critical: 15, high: 60 };

function slaBadge(a: { urgency: string; status: string; created_at: string }):
  | { text: string; cls: string }
  | null {
  const target = SLA_MINUTES[a.urgency];
  if (!target || a.status !== "active") return null;
  const elapsed = (Date.now() - new Date(a.created_at).getTime()) / 60000;
  const remaining = Math.round(target - elapsed);
  if (remaining <= 0) return { text: `SLA overdue ${Math.abs(remaining)}m`, cls: "bg-rose-600 text-white animate-pulse" };
  if (remaining <= target * 0.25) return { text: `SLA ${remaining}m left`, cls: "bg-amber-100 text-amber-800" };
  return { text: `SLA ${remaining}m`, cls: "bg-slate-100 text-slate-600" };
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const mins = Math.round((Date.now() - d) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function AlertsQueuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, setTick] = useState(0); // 30s heartbeat so SLA countdowns advance live

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(i);
  }, []);

  // Resolve the acting clinician at action time (avoids setState-in-effect).
  const getClinicianId = useCallback(async () => {
    const { data } = await createClient().auth.getUser();
    return data.user?.id ?? "demo-clinician";
  }, []);

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    // Admin-backed read: works in demo + authenticated mode (Plan: demo fix).
    const data = await listActiveAlerts();
    setAlerts(data as unknown as AlertRow[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    // Initial load inline (setState after await -> lint-safe).
    (async () => {
      const data = await listActiveAlerts();
      if (!active) return;
      setAlerts(data as unknown as AlertRow[]);
      setLoading(false);
    })();
    const channel = supabase
      .channel("alerts-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => fetchAlerts())
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  const onAck = async (a: AlertRow) => {
    setBusyId(a.id);
    const res = await acknowledgeAlert(a.id, await getClinicianId(), a.patient_id);
    setBusyId(null);
    if (!res.success) return toast({ title: "Failed", description: res.error, variant: "destructive" });
    toast({ title: "Acknowledged", description: "Alert assigned to you." });
    fetchAlerts();
  };

  const onRefer = async (a: AlertRow) => {
    setBusyId(a.id);
    const res = await createReferral({
      patientId: a.patient_id,
      alertId: a.id,
      reason: a.symptom_name || `${a.urgency} danger sign`,
      createdBy: await getClinicianId(),
    });
    setBusyId(null);
    if (!res.success) return toast({ title: "Failed", description: res.error, variant: "destructive" });
    toast({ title: "Referral created", description: "Tracked referral opened for this patient." });
  };

  const onResolve = async (a: AlertRow) => {
    const notes = window.prompt("Resolution notes (optional):") ?? undefined;
    setBusyId(a.id);
    const res = await resolveAlert(a.id, await getClinicianId(), { notes, patientId: a.patient_id });
    setBusyId(null);
    if (!res.success) return toast({ title: "Failed", description: res.error, variant: "destructive" });
    toast({ title: "Resolved", description: "Alert closed and logged." });
    fetchAlerts();
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const actionAlerts = alerts.filter((a) => a.urgency === "high" || a.urgency === "critical");
  const reviewAlerts = alerts.filter((a) => a.urgency === "medium" || a.urgency === "low");

  const renderAlert = (a: AlertRow) => {
    const u = URGENCY[a.urgency] ?? URGENCY.low;
    const name = a.patients?.full_name || a.patients?.name || "Unknown patient";
    const sla = slaBadge(a);
    return (
      <div
        key={a.id}
        className={`rounded-2xl bg-white p-4 sm:p-5 ring-1 ${u.ring} shadow-sm flex flex-col sm:flex-row sm:items-center gap-4`}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`shrink-0 w-10 h-10 rounded-xl ${u.chip} flex items-center justify-center`}>
            <u.Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => router.push(`/dashboard/patients/${a.patient_id}`)}
                className="font-semibold text-slate-900 hover:text-primary truncate"
              >
                {name}
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${u.chip}`}>
                {a.urgency}
              </span>
              {a.status === "acknowledged" && (
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {a.owner_name ? `ack'd · ${a.owner_name}` : "ack'd"}
                </span>
              )}
              {sla && (
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${sla.cls}`}>
                  {sla.text}
                </span>
              )}
              {(a.escalation_level ?? 0) > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  escalated
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 mt-0.5 truncate">
              {a.symptom_name || "Danger sign detected"}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {timeAgo(a.created_at)}
              </span>
              {a.patients?.phone_number && (
                <a
                  href={`tel:${a.patients.phone_number.replace(/\D/g, "")}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Phone className="h-3 w-3" /> Call
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {a.status === "active" && (
            <button
              onClick={() => onAck(a)}
              disabled={busyId === a.id}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Acknowledge
            </button>
          )}
          <button
            onClick={() => onRefer(a)}
            disabled={busyId === a.id}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 disabled:opacity-50"
          >
            <Ambulance className="h-4 w-4" /> Refer
          </button>
          <button
            onClick={() => onResolve(a)}
            disabled={busyId === a.id}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-glow-sm disabled:opacity-50"
          >
            <CircleCheck className="h-4 w-4" /> Resolve
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-[1100px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Triage Queue
              {activeCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-sm font-semibold ring-1 ring-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {activeCount} active
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              High &amp; critical alerts carry response SLAs; medium signs go to review.
            </p>
          </div>
          <button
            onClick={() => fetchAlerts(true)}
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
              <div key={i} className="h-24 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center mb-4">
              <Inbox className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">All clear</h3>
            <p className="text-sm text-slate-600">No active alerts in the queue right now.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Action needed ({actionAlerts.length})
              </h2>
              <div className="space-y-3">
                {actionAlerts.length === 0 ? (
                  <p className="text-sm text-slate-500">No high or critical alerts.</p>
                ) : (
                  actionAlerts.map(renderAlert)
                )}
              </div>
            </section>

            {reviewAlerts.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Needs review ({reviewAlerts.length})
                  <span className="ml-2 font-normal normal-case text-slate-400">
                    medium-urgency signs — confirm or close
                  </span>
                </h2>
                <div className="space-y-3">{reviewAlerts.map(renderAlert)}</div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
