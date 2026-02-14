"use client";

import { useState } from "react";
import type { DashboardPatient } from "@/types";
import SectionHeader from "./SectionHeader";
import PatientList from "./PatientList";
import PatientListSkeleton from "./PatientListSkeleton";

interface TriageSectionProps {
  id: string;
  title: string;
  icon: string;
  variant: "critical" | "warning" | "success";
  patients: DashboardPatient[];
  className?: string;
  isLoading?: boolean;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  showCount?: boolean;
  onSort?: (sortBy: string) => void;
}

export default function TriageSection({
  id,
  title,
  icon,
  variant,
  patients,
  className = "",
  isLoading = false,
  isCollapsible = false,
  defaultCollapsed = false,
  showCount = true,
  onSort,
}: TriageSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [sortBy, setSortBy] = useState<"priority" | "time" | "name">(
    "priority",
  );

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    if (onSort) {
      onSort(newSortBy);
    }
  };

  const patientCount = patients.length;
  const displayTitle =
    showCount && patientCount > 0 ? `${title} (${patientCount})` : title;

  return (
    <section aria-labelledby={id} className={className}>
      {/* Section Header with Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <SectionHeader
            id={id}
            title={displayTitle}
            icon={icon}
            variant={variant}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <div
              className="flex items-center gap-2 text-sm text-slate-500"
              role="status"
              aria-live="polite"
            >
              <span
                className="material-symbols-outlined text-[18px] animate-spin"
                aria-hidden="true"
              >
                progress_activity
              </span>
              <span className="sr-only">Loading patients...</span>
            </div>
          )}
        </div>

        {/* Section Actions */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          {patients.length > 1 && (
            <div className="relative">
              <label htmlFor={`${id}-sort`} className="sr-only">
                Sort patients by
              </label>
              <select
                id={`${id}-sort`}
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as typeof sortBy)}
                className="text-xs px-2 py-1 pr-7 bg-white border border-slate-200 rounded text-slate-600 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer appearance-none"
                aria-label="Sort patients"
              >
                <option value="priority">Sort by Priority</option>
                <option value="time">Sort by Time</option>
                <option value="name">Sort by Name</option>
              </select>
              <span
                className="absolute right-1 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-slate-400 pointer-events-none"
                aria-hidden="true"
              >
                arrow_drop_down
              </span>
            </div>
          )}

          {/* Collapse Toggle */}
          {isCollapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 rounded p-1 cursor-pointer"
              aria-expanded={!isCollapsed}
              aria-controls={`${id}-content`}
              aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform ${isCollapsed ? "" : "rotate-180"}`}
                aria-hidden="true"
              >
                expand_more
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Patient List */}
      {(!isCollapsible || !isCollapsed) && (
        <div id={`${id}-content`} aria-hidden={false}>
          {isLoading ? (
            <PatientListSkeleton count={3} />
          ) : (
            <PatientList
              patients={patients}
              emptyMessage={`No ${variant} patients at this time`}
            />
          )}
        </div>
      )}

      {/* Collapsed State Summary */}
      {isCollapsible && isCollapsed && patientCount > 0 && (
        <div
          className="text-sm text-slate-500 py-3 px-4 bg-slate-50 rounded-md border border-slate-200"
          id={`${id}-content-summary`}
          aria-hidden={false}
        >
          {patientCount} patient{patientCount !== 1 ? "s" : ""} hidden
        </div>
      )}
    </section>
  );
}
