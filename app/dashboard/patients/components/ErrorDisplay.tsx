import { CircleAlert } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="mb-6 p-4 bg-red-50/70 border border-red-200/60 rounded-xl text-sm text-red-800 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
          <CircleAlert className="h-4 w-4 text-red-600" />
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
