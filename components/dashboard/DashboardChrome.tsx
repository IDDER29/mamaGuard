"use client";

import { useCallback, useEffect, useState } from "react";
import type { Doctor, DashboardStats } from "@/types";
import DashboardSidebar from "./DashboardSidebar";
import DashboardSidebarMobile from "./DashboardSidebarMobile";
import DashboardHeader, { type Notification } from "./DashboardHeader";
import { OfflineBanner } from "./StateViews";
import { MobileBottomNav } from "./MobileBottomNav";
import { createClient } from "@/utils/supabase/client";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationRow,
} from "@/app/actions/notifications";
import { getCurrentProfile } from "@/app/actions/profiles";
import type { Role } from "@/lib/roles";
import {
  LocaleProvider,
  useLocale,
} from "@/lib/i18n/LocaleProvider";
import { toUiLocale, UI_LOCALES, type UiLocale } from "@/lib/i18n/dictionaries";

interface DashboardChromeProps {
  doctor: Doctor;
  stats: DashboardStats;
  children: React.ReactNode;
}

function relativeTime(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function toHeaderNotification(n: NotificationRow): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.body ?? "",
    time: relativeTime(n.created_at),
    type: n.type === "alert_critical" || n.type === "sla_breach" ? "critical" : "warning",
    read: n.read_at != null,
    patientId: n.patient_id ?? undefined,
  };
}

/**
 * Client shell for the dashboard. Owns the mobile-drawer state and feeds the
 * header live clinician notifications (Plan E1.1) via the admin-backed actions,
 * refreshed on any `notifications` table change.
 *
 * Pinned to the `light` theme: the clinical UI is a bright, high-contrast surface.
 */
export default function DashboardChrome({
  doctor,
  stats,
  children,
}: DashboardChromeProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [initialLocale, setInitialLocale] = useState<UiLocale>("en");

  const refresh = useCallback(async () => {
    const rows = await listNotifications();
    setNotifications(rows.map(toHeaderNotification));
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    (async () => {
      const [rows, profile] = await Promise.all([listNotifications(), getCurrentProfile()]);
      if (!active) return;
      setNotifications(rows.map(toHeaderNotification));
      setRole(profile.role);
      setInitialLocale(toUiLocale(profile.ui_language));
    })();
    const channel = supabase
      .channel("notifications-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  const onMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void markNotificationRead(id);
  }, []);

  const onMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void markAllNotificationsRead();
  }, []);

  return (
    <LocaleProvider key={initialLocale} initialLocale={initialLocale}>
      <div className="light h-screen flex bg-background text-foreground overflow-hidden">
        <DashboardSidebar doctor={doctor} role={role} />
        <DashboardSidebarMobile
          doctor={doctor}
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          <LanguageSwitcher />
          <OfflineBanner />
          <DashboardHeader
            stats={stats}
            notifications={notifications}
            onRefresh={refresh}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDismissNotification={onMarkAsRead}
            enableNotificationSound
            onOpenSidebar={() => setMobileNavOpen(true)}
          />
          <div className="flex-1 overflow-y-auto bg-slate-50/50 pb-16 lg:pb-0">{children}</div>
        </main>
        <MobileBottomNav />
      </div>
    </LocaleProvider>
  );
}

/** Unobtrusive EN/FR/AR toggle, rendered just above the offline banner. */
function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex justify-end gap-1 px-3 py-1.5 bg-slate-50/50 border-b border-slate-200">
      {UI_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
            locale === l
              ? "bg-primary text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
