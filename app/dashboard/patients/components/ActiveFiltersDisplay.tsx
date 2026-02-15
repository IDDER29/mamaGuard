interface ActiveFiltersDisplayProps {
  totalResults: number;
  searchQuery: string;
  showHighRiskOnly: boolean;
  showOverdueOnly: boolean;
}

export function ActiveFiltersDisplay({
  totalResults,
  searchQuery,
  showHighRiskOnly,
  showOverdueOnly,
}: ActiveFiltersDisplayProps) {
  return (
    <div className="mb-6 px-4 py-3 bg-blue-50/60 border border-blue-200/50 rounded-xl text-sm shadow-sm">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-blue-600">Showing </span>
        <strong className="text-blue-900 font-semibold">{totalResults}</strong>
        <span className="text-blue-600">
          patient{totalResults !== 1 ? "s" : ""}
        </span>
        {searchQuery && (
          <span className="text-blue-700">
            matching <strong className="font-medium">"{searchQuery}"</strong>
          </span>
        )}
        {showHighRiskOnly && (
          <span className="inline-flex items-center px-2 py-1 bg-rose-100/80 border border-rose-200/70 rounded-md text-rose-700 font-medium text-xs">
            HIGH RISK
          </span>
        )}
        {showOverdueOnly && (
          <span className="inline-flex items-center px-2 py-1 bg-amber-100/80 border border-amber-200/70 rounded-md text-amber-700 font-medium text-xs">
            OVERDUE
          </span>
        )}
      </div>
    </div>
  );
}
