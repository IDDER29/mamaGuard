"use client";

const CARD_COUNT = 8;

export function PatientGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
      aria-busy="true"
      aria-label="Loading patients"
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-pulse h-full flex flex-col"
        >
          {/* Badge skeleton - top right - Fixed position */}
          <div className="flex justify-end items-start mb-4">
            <div className="h-6 w-20 bg-slate-200 rounded" />
          </div>

          {/* Avatar + Name - Fixed Height */}
          <div className="flex items-center gap-3.5 mb-4 h-14">
            <div className="h-12 w-12 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
          </div>

          {/* AI Analysis Box - Fixed Height */}
          <div className="rounded-lg p-3 mb-4 border border-slate-100 bg-slate-50 min-h-[88px] flex flex-col">
            <div className="h-3 w-20 bg-slate-200 rounded mb-2 flex-shrink-0" />
            <div className="space-y-1">
              <div className="h-3 w-full bg-slate-200 rounded" />
              <div className="h-3 w-4/5 bg-slate-200 rounded" />
            </div>
          </div>

          {/* Progress Bar - Fixed Height */}
          <div className="mb-4 px-1">
            <div className="flex justify-between mb-2 h-4 items-center">
              <div className="h-3 w-12 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-200 rounded" />
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full" />
          </div>

          {/* Footer: Care Team + Actions - Fixed Height, pushed to bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto h-12">
            <div className="flex -space-x-1.5">
              <div className="h-7 w-7 rounded-full bg-slate-200 border-2 border-white flex-shrink-0" />
              <div className="h-7 w-7 rounded-full bg-slate-200 border-2 border-white flex-shrink-0" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
