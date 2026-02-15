interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="mb-6 p-4 bg-red-50/70 border border-red-200/60 rounded-xl text-sm text-red-800 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-600 text-base">
            error
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <strong className="font-medium block mb-0.5 text-red-900">
            Error Loading Patients
          </strong>
          <span className="text-red-700 text-xs">{error}</span>
        </div>
      </div>
    </div>
  );
}
