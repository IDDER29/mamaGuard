import type { Patient } from "@/types";

export const STATUS_STYLES = {
  critical: {
    card: "border-l-4 border-l-red-500 border-slate-200 bg-red-50/30",
    badge: "bg-red-500 text-white",
    bar: "bg-red-500",
    chipBg: "bg-red-50 text-red-700 border-red-200",
  },
  high: {
    card: "border-l-4 border-l-orange-500 border-slate-200 bg-orange-50/30",
    badge: "bg-orange-500 text-white",
    bar: "bg-orange-500",
    chipBg: "bg-orange-50 text-orange-700 border-orange-200",
  },
  medium: {
    card: "border-l-4 border-l-amber-500 border-slate-200",
    badge: "bg-amber-500 text-white",
    bar: "bg-amber-500",
    chipBg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  low: {
    card: "border-l-4 border-l-emerald-500 border-slate-200",
    badge: "bg-emerald-500 text-white",
    bar: "bg-emerald-500",
    chipBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
} as const;

interface PatientCardImprovedProps {
  patient: Patient;
  isExpanded: boolean;
  onExpand: () => void;
  onPatientClick: (id: string) => void;
}

export function PatientCardImproved({
  patient,
  isExpanded,
  onExpand,
  onPatientClick,
}: PatientCardImprovedProps) {
  const currentRisk = patient.risk_level || "low";
  const styles = STATUS_STYLES[currentRisk as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.low;

  /** Progress bar: 40-week term = 100% (matches @/types Patient.gestational_week) */
  const progress = Math.min(Math.round((patient.gestational_week / 40) * 100), 100);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (patient.phone_number) window.location.href = `tel:${patient.phone_number}`;
  };

  return (
    <article
      onClick={() => onPatientClick(patient.id)}
      className={`group relative bg-white rounded-xl border ${styles.card} hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
    >
      <div className="p-5">
        {/* Header: Name + Risk Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border border-teal-200">
              {((patient.full_name ?? patient.name) || "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                {patient.full_name ?? patient.name ?? "—"}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">ID: {patient.national_id ?? patient.id.slice(0, 8)}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${styles.badge}`}>
            {currentRisk}
          </span>
        </div>

        {/* Clinical Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Week</p>
            <p className="text-sm font-black text-slate-800">{patient.gestational_week}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
            <p className="text-[9px] text-slate-400 uppercase font-bold">Blood</p>
            <p className="text-sm font-black text-slate-800">{patient.blood_type || '—'}</p>
          </div>
        </div>

        {/* AI Insight (Using medical_history) */}
        <div className={`rounded-lg p-3 mb-4 border ${styles.chipBg}`}>
          <div className="flex items-start gap-2 text-xs">
            <span className="material-symbols-outlined text-sm">psychology</span>
            <p className={isExpanded ? "" : "line-clamp-2"}>
              {patient.medical_history?.notes || "No critical medical history recorded for this patient."}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 px-1">
            <span>PREGNANCY PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${styles.bar}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Footer: Location + Call Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate max-w-[120px]">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="truncate">{patient.location_address ?? "—"}</span>
          </div>

          <div className="flex gap-2">
            {patient.phone_number && (
              <button
                onClick={handleCall}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">call</span>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onExpand(); }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-sm">{isExpanded ? 'close_fullscreen' : 'open_in_full'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}