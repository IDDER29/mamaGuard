"use client";

import { useRouter } from "next/navigation";

interface PatientActionBarProps {
  patientName: string;
  patientId: string;
  onMarkResolved: () => void;
  onSchedule: () => void;
  onEscalate: () => void;
}

export default function PatientActionBar({
  patientName,
  patientId,
  onMarkResolved,
  onSchedule,
  onEscalate
}: PatientActionBarProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/20 text-sky-600">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              health_and_safety
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            <span className="hidden sm:inline">MamaGuard</span>
            <span className="sm:hidden">MG</span>
            <span className="font-normal text-slate-400 text-sm sm:text-base ml-2 hidden md:inline">
              Clinical Portal
            </span>
          </h1>
          <span className="h-6 w-px bg-slate-300 mx-2" aria-hidden="true" />
          
          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center text-sm" aria-label="Breadcrumb">
            <button
              onClick={() => router.push('/dashboard')}
              type="button"
              className="text-slate-500 hover:text-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 rounded px-1"
            >
              Patients
            </button>
            <span className="material-symbols-outlined text-slate-400 text-base mx-1" aria-hidden="true">
              chevron_right
            </span>
            <span className="text-slate-800 font-medium">
              {patientName}
            </span>
          </nav>
        </div>
        
        {/* Global Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMarkResolved}
            className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[44px] text-sm font-medium text-slate-600 hover:text-sky-600 bg-transparent hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            type="button"
            aria-label="Mark patient case as resolved"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              check_circle_outline
            </span>
            <span>Mark Resolved</span>
          </button>
          
          <button
            onClick={onSchedule}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
            type="button"
            aria-label="Schedule appointment"
          >
            <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
              calendar_today
            </span>
            <span className="hidden sm:inline">Schedule</span>
          </button>
          
          <button
            onClick={onEscalate}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
            type="button"
            aria-label="Escalate to emergency care"
          >
            <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
              warning
            </span>
            <span className="hidden sm:inline">Escalate</span>
          </button>
        </div>
      </div>
    </header>
  );
}
