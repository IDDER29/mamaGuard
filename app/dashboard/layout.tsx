import type { Metadata } from "next";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
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
      <DashboardChrome doctor={mockDoctor} stats={mockStats}>
        {children}
      </DashboardChrome>

      {/* Command Palette */}
      <CommandPalette />
    </TooltipProvider>
  );
}
