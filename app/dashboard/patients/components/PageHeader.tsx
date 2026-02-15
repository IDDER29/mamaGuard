interface PageHeaderProps {
  totalPatients: number;
  highRiskCount: number;
}

export function PageHeader({ totalPatients, highRiskCount }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="px-4 sm:px-6 py-4">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Patient Management
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100/80 border border-emerald-200/80 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
                  Live
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <span className="hidden sm:inline text-slate-500">
                <span className="font-medium text-slate-900">{totalPatients}</span> total
              </span>
              {highRiskCount > 0 && (
                <>
                  <span className="hidden sm:inline text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50/80 border border-rose-200/60 rounded-md">
                    <span className="font-semibold text-rose-700">{highRiskCount}</span>
                    <span className="text-rose-600 text-xs hidden sm:inline">high risk</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
