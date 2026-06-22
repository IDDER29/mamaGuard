"use client";

// Plan E5.4 — dashboard segment error boundary. Catches render/load errors in
// any /dashboard route so a clinician never hits a blank screen.

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-sm p-8">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 ring-1 ring-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7 text-rose-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Something went wrong</h2>
        <p className="text-sm text-slate-600 mb-5">
          This screen failed to load. Your data is safe — try again, and if it
          persists, refresh the page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          <RotateCw className="h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  );
}
