"use client";

const CARD_COUNT = 8;

export function PatientGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      aria-busy="true"
      aria-label="Loading patients"
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
        >
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-28" />
                  <div className="h-3 bg-slate-100 rounded w-20" />
                </div>
              </div>
              <div className="h-5 w-14 bg-slate-200 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="h-14 bg-slate-100 rounded-lg" />
              <div className="h-14 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-16 bg-slate-100 rounded-lg mb-4" />
            <div className="h-2 bg-slate-100 rounded-full mb-4" />
            <div className="flex justify-between pt-3 border-t border-slate-100">
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100" />
                <div className="w-8 h-8 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
