export default function PatientDetailLoading() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="h-14 bg-white border-b border-slate-200 animate-pulse" />
      <div className="flex-1 flex gap-4 p-4 max-w-7xl mx-auto w-full">
        <div className="w-72 shrink-0 space-y-4">
          <div className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
          <div className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="h-24 bg-teal-50 rounded-xl border border-teal-100 animate-pulse" />
          <div className="flex-1 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
        <div className="w-72 shrink-0">
          <div className="h-40 bg-white rounded-xl border border-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
