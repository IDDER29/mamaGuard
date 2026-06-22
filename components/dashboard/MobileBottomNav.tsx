"use client";

// Plan E3.2 — mobile bottom tab bar for field use (CHWs on phones). Hidden on
// lg+, where the sidebar takes over. Four field-critical destinations.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Siren, ClipboardList, Users, Settings } from "lucide-react";

const TABS = [
  { href: "/dashboard/alerts", icon: Siren, label: "Queue" },
  { href: "/dashboard/chw", icon: ClipboardList, label: "Worklist" },
  { href: "/dashboard/patients", icon: Users, label: "Patients" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex"
      role="navigation"
      aria-label="Primary"
    >
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[11px] font-medium ${
              active ? "text-primary" : "text-slate-500"
            }`}
          >
            <t.icon className={`h-5 w-5 ${active ? "text-primary" : "text-slate-400"}`} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
