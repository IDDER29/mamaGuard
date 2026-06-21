"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { Doctor } from "@/types";
import { SidebarContent } from "./DashboardSidebar";

interface DashboardSidebarMobileProps {
  doctor: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-in clinical navigation for screens below `lg`. Reuses the exact desktop
 * sidebar content and closes itself whenever a navigation item is tapped.
 */
export default function DashboardSidebarMobile({
  doctor,
  open,
  onOpenChange,
}: DashboardSidebarMobileProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 lg:hidden">
        <SheetTitle className="sr-only">Clinical navigation</SheetTitle>
        <SidebarContent doctor={doctor} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
