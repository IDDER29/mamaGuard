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
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-[300px]">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by name, phone, or ID..."
            className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleHighRisk}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            showHighRiskOnly
              ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-sm">warning</span>
          High Risk ({highRiskCount})
        </button>
        {onToggleOverdue && (
          <button
            type="button"
            onClick={onToggleOverdue}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              showOverdueOnly
                ? "bg-red-500 text-white shadow-lg shadow-red-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              event_busy
            </span>
            Overdue
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
            aria-label="Refresh patient list"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${refreshing ? "animate-spin" : ""}`}
            >
              refresh
            </span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewPatient}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-md cursor-pointer"
      >
        <span className="material-symbols-outlined">person_add</span>
        Enroll New Mother
      </button>
    </div>
  );
}
