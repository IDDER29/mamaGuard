"use client";

import { useState } from "react";
import type { Doctor, DashboardStats } from "@/types";
import DashboardSidebar from "./DashboardSidebar";
import DashboardSidebarMobile from "./DashboardSidebarMobile";
import DashboardHeader from "./DashboardHeader";

interface DashboardChromeProps {
  doctor: Doctor;
  stats: DashboardStats;
  children: React.ReactNode;
}

/**
 * Client shell for the dashboard. Owns the mobile-drawer open state and lays out
 * the responsive sidebar + header + scroll region.
 *
 * The whole subtree is pinned to the `light` theme: the clinical UI is designed
 * as a bright, high-contrast surface and does not have dark-mode styling, so the
 * marketing theme toggle must not bleed in here.
 */
export default function DashboardChrome({
  doctor,
  stats,
  children,
}: DashboardChromeProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="light h-screen flex bg-background text-foreground overflow-hidden">
      <DashboardSidebar doctor={doctor} />
      <DashboardSidebarMobile
        doctor={doctor}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <DashboardHeader
          stats={stats}
          onOpenSidebar={() => setMobileNavOpen(true)}
        />
        <div className="flex-1 overflow-y-auto bg-slate-50/50">{children}</div>
      </main>
    </div>
  );
}
