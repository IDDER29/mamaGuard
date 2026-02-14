import type { Metadata } from "next";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard";
import CommandPalette from "@/components/dashboard/CommandPalette";
import { mockDoctor, mockStats } from "@/lib/mockData";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Clinical Dashboard | MamaGuard",
  description:
    "Real-time patient monitoring and triage system for maternal healthcare professionals",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background overflow-hidden">
        <DashboardSidebar doctor={mockDoctor} />

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardHeader stats={mockStats} />
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {children}
          </div>
        </main>

        {/* Command Palette */}
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}
