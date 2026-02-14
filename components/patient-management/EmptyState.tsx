"use client";

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
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-4xl text-slate-400">group</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No patients yet</h3>
        <p className="text-sm text-slate-600 mb-6 max-w-sm">
          Enroll your first mother to start AI-powered monitoring and care.
        </p>
        {onNewPatient && (
          <button
            onClick={onNewPatient}
            className="px-5 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors cursor-pointer inline-flex items-center gap-2"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Enroll New Mother
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
      <p className="text-sm text-slate-600 mb-6">
        {searchQuery
          ? `No results for "${searchQuery}". Try adjusting your search.`
          : "No patients match the selected filters."}
      </p>
      <button
        onClick={onClearSearch}
        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
        type="button"
      >
        Clear Filters
      </button>
    </div>
  );
}
