import Image from "next/image";
import type { Patient } from "@/types";

interface PatientHeaderProps {
  patient: Patient;
  avatarUrl?: string | null;
}

function ageFromDateOfBirth(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientHeader({ patient, avatarUrl }: PatientHeaderProps) {
  const displayName = patient.full_name ?? patient.name ?? "—";
  const riskLevel = patient.risk_level; // 'low' | 'medium' | 'high' | 'critical'
  const age = ageFromDateOfBirth(patient.date_of_birth);

  const riskColors: Record<string, string> = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-green-50 text-green-700 border-green-200",
  };
  const riskIndicators: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-green-500",
  };
  const riskColor = riskColors[riskLevel] ?? riskColors.low;
  const riskIndicator = riskIndicators[riskLevel] ?? riskIndicators.low;

  const hasMeta = age != null || patient.gestational_week != null || patient.trimester != null || patient.blood_type != null || patient.location_address;

  return (
    <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start md:items-center gap-3 sm:gap-5">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Portrait of ${displayName}`}
                width={80}
                height={80}
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover border-2 sm:border-4 border-slate-50 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl">
                {(displayName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 ${riskIndicator} border-2 border-white rounded-full`}
              role="status"
              aria-label={`${riskLevel} risk level indicator`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                {displayName}
              </h1>
              <span
                className={`px-2 sm:px-2.5 py-0.5 rounded-full ${riskColor} text-[10px] sm:text-xs font-bold uppercase tracking-wide border whitespace-nowrap`}
                role="status"
                aria-label={`Patient risk level: ${riskLevel}`}
              >
                {riskLevel} Risk
              </span>
            </div>

            {hasMeta && (
              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
                {age != null && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
                      cake
                    </span>
                    <span>{age} Years</span>
                  </div>
                )}
                {(patient.gestational_week != null || patient.trimester != null) && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
                      child_care
                    </span>
                    <span className="whitespace-nowrap">
                      {patient.gestational_week != null && `Week ${patient.gestational_week}`}
                      {patient.gestational_week != null && patient.trimester != null && " "}
                      {patient.trimester != null && `(T${patient.trimester})`}
                    </span>
                  </div>
                )}
                {patient.blood_type && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
                      bloodtype
                    </span>
                    <span className="whitespace-nowrap">Type: {patient.blood_type}</span>
                  </div>
                )}
                {patient.location_address && (
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 max-w-[200px] sm:max-w-none">
                    <span className="material-symbols-outlined text-base sm:text-lg shrink-0" aria-hidden="true">
                      pin_drop
                    </span>
                    <span className="truncate" title={patient.location_address}>{patient.location_address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="material-symbols-outlined text-base sm:text-lg" aria-hidden="true">
                    badge
                  </span>
                  <span className="whitespace-nowrap">ID: #{patient.id}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
