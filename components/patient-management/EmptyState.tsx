"use client";

import { Users, SearchX, UserPlus } from "lucide-react";

interface EmptyStateProps {
  searchQuery?: string;
  onClearSearch: () => void;
  /** When true, DB has no patients at all (show enroll CTA). */
  isEmptyDatabase?: boolean;
  onNewPatient?: () => void;
}

export function EmptyState({
  searchQuery,
  onClearSearch,
  isEmptyDatabase,
  onNewPatient,
}: EmptyStateProps) {
  if (isEmptyDatabase) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-200/30 ring-1 ring-primary/10 flex items-center justify-center mb-5">
          <Users className="h-9 w-9 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No patients yet</h3>
        <p className="text-sm text-slate-600 mb-6 max-w-sm">
          Enroll your first mother to start AI-powered monitoring and care.
        </p>
        {onNewPatient && (
          <button
            onClick={onNewPatient}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-glow-sm transition-all hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
            type="button"
          >
            <UserPlus className="h-5 w-5" />
            Enroll New Mother
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <SearchX className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
      <p className="text-sm text-slate-600 mb-6">
        {searchQuery
          ? `No results for “${searchQuery}”. Try adjusting your search.`
          : "No patients match the selected filters."}
      </p>
      <button
        onClick={onClearSearch}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium"
        type="button"
      >
        Clear Filters
      </button>
    </div>
  );
}
