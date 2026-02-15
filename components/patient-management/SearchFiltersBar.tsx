"use client";

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
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search patients..."
            className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50/80 border border-slate-200/80 rounded-lg hover:bg-white hover:border-slate-300 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all duration-200 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors duration-150 cursor-pointer"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-lg">close</span>
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
          <span className="material-symbols-outlined text-base sm:text-lg">warning</span>
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
            <span className="material-symbols-outlined text-base sm:text-lg">
              event_busy
            </span>
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
            <span
              className={`material-symbols-outlined text-[20px] ${refreshing ? "animate-spin" : ""}`}
            >
              refresh
            </span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewPatient}
        className="bg-teal-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        <span className="hidden sm:inline">Enroll New Mother</span>
        <span className="sm:hidden">New</span>
      </button>
    </div>
  );
}
