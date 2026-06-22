"use client";

// Plan E5.1 — notifications center (full history). The header bell is the quick
// view; this is the searchable log with mark-read.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRow,
} from "@/app/actions/notifications";
import { EmptyState } from "@/components/dashboard/StateViews";

function relative(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const TYPE_STYLE: Record<string, string> = {
  alert_critical: "bg-rose-50 text-rose-700",
  sla_breach: "bg-rose-50 text-rose-700",
  alert_high: "bg-orange-50 text-orange-700",
  sla_warning: "bg-amber-50 text-amber-700",
  system: "bg-slate-100 text-slate-600",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const rows = await listNotifications(100);
    setItems(rows);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await listNotifications(100);
      if (active) {
        setItems(rows);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onOpen = async (n: NotificationRow) => {
    if (!n.read_at) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      await markNotificationRead(n.id);
    }
    if (n.patient_id) router.push(`/dashboard/patients/${n.patient_id}`);
  };

  const onMarkAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
    await markAllNotificationsRead();
    refresh();
  };

  const unread = items.filter((i) => !i.read_at).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="h-7 w-7 text-primary" /> Notifications
            </h1>
            <p className="text-sm text-slate-600 mt-1">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button
              onClick={onMarkAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications" description="Critical alerts and SLA warnings will appear here." />
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => onOpen(n)}
                className={`w-full text-left rounded-xl bg-white p-4 ring-1 shadow-sm flex items-start gap-3 hover:ring-primary/30 ${
                  n.read_at ? "ring-slate-200/70" : "ring-primary/30 bg-primary/[0.02]"
                }`}
              >
                <span className={`shrink-0 mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_STYLE[n.type] ?? "bg-slate-100 text-slate-600"}`}>
                  {n.type.replace("_", " ")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{n.title}</p>
                  {n.body && <p className="text-sm text-slate-600 truncate">{n.body}</p>}
                  <p className="text-[11px] text-slate-400 mt-0.5">{relative(n.created_at)}</p>
                </div>
                {!n.read_at && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
