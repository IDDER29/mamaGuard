"use client";

import { Search, X, TriangleAlert, CalendarX, RefreshCw, UserPlus } from "lucide-react";

interface SearchFiltersBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  showHighRiskOnly: boolean;
  onToggleHighRisk: () => void;
  showOverdueOnly?: boolean;
  onToggleOverdue?: () => void;
  onNewPatient: () => void;
  highRiskCount: number;
  /** Optional refresh control (e.g. pull-to-refresh / manual refresh). */
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function SearchFiltersBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  showHighRiskOnly,
  onToggleHighRisk,
  showOverdueOnly,
  onToggleOverdue,
  onNewPatient,
  highRiskCount,
  refreshing,
  onRefresh,
}: SearchFiltersBarProps) {
  return (
    <div className="bg-white px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[280px]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search patients..."
            className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50/80 border border-slate-200/80 rounded-lg hover:bg-white hover:border-slate-300 focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-200 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors duration-150 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleHighRisk}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            showHighRiskOnly
              ? "bg-rose-500 text-white shadow-sm hover:bg-rose-600 focus:ring-rose-300"
              : "bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus:ring-slate-200"
          }`}
        >
          <TriangleAlert className="h-4 w-4" />
          <span className="hidden sm:inline">High Risk</span>
          <span className="font-semibold">({highRiskCount})</span>
        </button>
        {onToggleOverdue && (
          <button
            type="button"
            onClick={onToggleOverdue}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              showOverdueOnly
                ? "bg-amber-500 text-white shadow-sm hover:bg-amber-600 focus:ring-amber-300"
                : "bg-slate-100/80 text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus:ring-slate-200"
            }`}
          >
            <CalendarX className="h-4 w-4" />
            <span className="hidden sm:inline">Overdue</span>
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all duration-150 cursor-pointer"
            aria-label="Refresh patient list"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewPatient}
        className="bg-primary text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-glow-sm hover:-translate-y-0.5 cursor-pointer"
      >
        <UserPlus className="h-5 w-5" />
        <span className="hidden sm:inline">Enroll New Mother</span>
        <span className="sm:hidden">New</span>
      </button>
    </div>
  );
}
