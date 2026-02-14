"use client";

import { useState } from "react";
import type { DashboardPatient } from "@/types";
import PatientCard from "./PatientCard";

interface PatientListProps {
  patients: DashboardPatient[];
  emptyMessage?: string;
  isLoading?: boolean;
  layout?: "grid" | "list";
  columns?: 1 | 2 | 3;
  showSkeleton?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  maxItems?: number;
}

function PatientCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex overflow-hidden animate-pulse">
      <div className="w-1.5 bg-slate-200 shrink-0" />
      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
        {/* Avatar & Info Skeleton */}
        <div className="flex items-start gap-3 w-full md:w-1/4 min-w-[200px]">
          <div className="w-12 h-12 rounded bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-2 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
        
        {/* Alert Skeleton */}
        <div className="flex-1 min-w-[250px] space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-full" />
        </div>
        
        {/* Chart Skeleton */}
        <div className="w-full md:w-48 h-12">
          <div className="h-full bg-slate-200 rounded" />
        </div>
        
        {/* Actions Skeleton */}
        <div className="flex gap-2">
          <div className="w-20 h-8 bg-slate-200 rounded" />
          <div className="w-20 h-8 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function PatientList({ 
  patients, 
  emptyMessage = "No patients in this category",
  isLoading = false,
  layout = "list",
  columns = 1,
  showSkeleton = true,
  selectable = false,
  onSelectionChange,
  maxItems
}: PatientListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const displayedPatients = maxItems && !showAll 
    ? patients.slice(0, maxItems) 
    : patients;

  const hasMore = maxItems && patients.length > maxItems;

  const handleSelect = (patientId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedIds, patientId]
      : selectedIds.filter(id => id !== patientId);
    
    setSelectedIds(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? displayedPatients.map(p => p.id) : [];
    setSelectedIds(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Loading State
  if (isLoading && showSkeleton) {
    return (
      <div 
        className="grid grid-cols-1 gap-4"
        role="status"
        aria-busy="true"
        aria-label="Loading patients"
      >
        {[...Array(3)].map((_, i) => (
          <PatientCardSkeleton key={i} />
        ))}
        <span className="sr-only">Loading patient data...</span>
      </div>
    );
  }

  // Empty State
  if (patients.length === 0) {
    return (
      <div 
        className="bg-white rounded-lg border border-slate-200 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <span 
          className="material-symbols-outlined text-slate-300 text-5xl mb-3 block"
          aria-hidden="true"
        >
          {isLoading ? "hourglass_empty" : "health_and_safety"}
        </span>
        <p className="text-slate-500 text-sm">
          {isLoading ? "Loading patients..." : emptyMessage}
        </p>
      </div>
    );
  }

  const gridClasses = layout === "grid" 
    ? `grid gap-4 ${
        columns === 3 ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" :
        columns === 2 ? "grid-cols-1 lg:grid-cols-2" :
        "grid-cols-1"
      }`
    : "grid grid-cols-1 gap-4";

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      {selectable && displayedPatients.length > 0 && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedIds.length === displayedPatients.length && displayedPatients.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-slate-300 text-sky-500 focus:ring-sky-500 h-4 w-4 cursor-pointer"
              aria-label="Select all patients"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 select-none">
              {selectedIds.length > 0 
                ? `${selectedIds.length} selected` 
                : "Select all"}
            </span>
          </label>
          
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs px-3 py-1 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                onClick={() => {
                  setSelectedIds([]);
                  if (onSelectionChange) onSelectionChange([]);
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="text-xs px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                onClick={() => {
                  console.log("Bulk action for:", selectedIds);
                  // TODO: Implement bulk actions
                }}
              >
                Bulk Action
              </button>
            </div>
          )}
        </div>
      )}

      {/* Patient Cards */}
      <ul 
        className={gridClasses}
        aria-label="Patient list"
      >
        {displayedPatients.map((patient, index) => (
          <li
            key={patient.id}
            className="relative patient-card-item"
            style={{
              '--animation-delay': `${index * 0.05}s`
            } as React.CSSProperties}
          >
            {selectable && (
              <div className="absolute -left-3 top-4 z-10">
                <label className="block cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(patient.id)}
                    onChange={(e) => handleSelect(patient.id, e.target.checked)}
                    className="rounded border-slate-300 text-sky-500 focus:ring-sky-500 h-4 w-4 cursor-pointer shadow-sm"
                    aria-label={`Select ${patient.full_name ?? patient.name}`}
                  />
                </label>
              </div>
            )}
            <PatientCard patient={patient} />
          </li>
        ))}
      </ul>

      {/* Show More/Less */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            <span>{showAll ? "Show Less" : `Show ${patients.length - maxItems} More`}</span>
            <span 
              className={`material-symbols-outlined text-[18px] transition-transform ${showAll ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              expand_more
            </span>
          </button>
        </div>
      )}

      {/* Add fadeIn animation */}
      <style jsx>{`
        .patient-card-item {
          animation: fadeIn 0.3s ease-in var(--animation-delay, 0s) both;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
