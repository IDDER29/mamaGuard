"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { mockCriticalPatients, mockWarningPatients } from "@/lib/mockData";

interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  group: "navigation" | "actions" | "patients" | "filters";
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Helper function to check if user is typing in an input
  const isTypingInInput = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    return (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  }, []);

  // Toggle command palette with CMD+K or CTRL+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // ESC to close (handled by CommandDialog but added as backup)
      if (e.key === "Escape") {
        setOpen(false);
      }

      // Quick shortcuts when palette is closed
      if (!open) {
        // N - New Patient
        if (e.key === "n" && !e.metaKey && !e.ctrlKey && !isTypingInInput(e)) {
          e.preventDefault();
          router.push("/dashboard/patients/new");
        }
        // / - Focus search
        if (e.key === "/" && !e.metaKey && !e.ctrlKey && !isTypingInInput(e)) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, router, isTypingInInput]);

  const allPatients = [...mockCriticalPatients, ...mockWarningPatients];

  const commands: CommandAction[] = [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Dashboard",
      description: "Go to main dashboard",
      icon: "dashboard",
      action: () => router.push("/dashboard"),
      shortcut: "G D",
      group: "navigation",
    },
    {
      id: "nav-patients",
      label: "Patient List",
      description: "View all patients",
      icon: "groups",
      action: () => router.push("/dashboard/patients"),
      shortcut: "G P",
      group: "navigation",
    },
    {
      id: "nav-analytics",
      label: "Analytics",
      description: "View analytics dashboard",
      icon: "bar_chart",
      action: () => router.push("/dashboard/analytics"),
      shortcut: "G A",
      group: "navigation",
    },
    // Actions
    {
      id: "action-new-patient",
      label: "New Patient",
      description: "Add a new patient record",
      icon: "person_add",
      action: () => router.push("/dashboard/patients/new"),
      shortcut: "N",
      group: "actions",
    },
    {
      id: "action-refresh",
      label: "Refresh Data",
      description: "Reload patient information",
      icon: "refresh",
      action: () => window.location.reload(),
      shortcut: "R",
      group: "actions",
    },
    {
      id: "action-export",
      label: "Export Data",
      description: "Export patient data to CSV",
      icon: "download",
      action: () => alert("Export functionality coming soon!"),
      group: "actions",
    },
    // Filters
    {
      id: "filter-critical",
      label: "Show Critical Only",
      description: "Filter to critical patients",
      icon: "error",
      action: () => router.push("/dashboard?filter=critical"),
      group: "filters",
    },
    {
      id: "filter-warning",
      label: "Show Warnings Only",
      description: "Filter to warning patients",
      icon: "warning",
      action: () => router.push("/dashboard?filter=warning"),
      group: "filters",
    },
    {
      id: "filter-all",
      label: "Show All Patients",
      description: "Clear all filters",
      icon: "filter_list_off",
      action: () => router.push("/dashboard"),
      group: "filters",
    },
  ];

  const handleSelect = useCallback((action: () => void) => {
    setOpen(false);
    // Small delay to allow dialog to close smoothly
    setTimeout(() => action(), 100);
  }, []);

  const filteredPatients = search
    ? allPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.alert.category.toLowerCase().includes(search.toLowerCase()) ||
          p.alert.message.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  return (
    <>
      {/* Trigger Button (optional, shown in header or elsewhere) */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search patients..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation Commands */}
          <CommandGroup heading="Navigation">
            {commands
              .filter((cmd) => cmd.group === "navigation")
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleSelect(cmd.action)}
                  className="cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] mr-3 text-slate-500">
                    {cmd.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-xs text-slate-500">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <kbd className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Actions */}
          <CommandGroup heading="Actions">
            {commands
              .filter((cmd) => cmd.group === "actions")
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleSelect(cmd.action)}
                  className="cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] mr-3 text-slate-500">
                    {cmd.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-xs text-slate-500">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <kbd className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Filters */}
          <CommandGroup heading="Filters">
            {commands
              .filter((cmd) => cmd.group === "filters")
              .map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => handleSelect(cmd.action)}
                  className="cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] mr-3 text-slate-500">
                    {cmd.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{cmd.label}</div>
                    {cmd.description && (
                      <div className="text-xs text-slate-500">
                        {cmd.description}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>

          {/* Patient Search Results */}
          {filteredPatients.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Patients">
                {filteredPatients.slice(0, 5).map((patient) => (
                  <CommandItem
                    key={patient.id}
                    onSelect={() =>
                      handleSelect(() =>
                        router.push(`/dashboard/patients/${patient.id}`),
                      )
                    }
                    className="cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] mr-3 text-slate-500">
                      person
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-slate-500">
                        ID: {patient.patientId} • {patient.alert.category}
                      </div>
                    </div>
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
                        patient.riskLevel === "critical"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {patient.riskLevel}
                    </span>
                  </CommandItem>
                ))}
                {filteredPatients.length > 5 && (
                  <CommandItem disabled>
                    <div className="text-xs text-slate-500 text-center w-full">
                      +{filteredPatients.length - 5} more patients...
                    </div>
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* Keyboard Shortcut Hint (optional - can be shown in footer) */}
    </>
  );
}
