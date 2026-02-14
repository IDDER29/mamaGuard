"use client";

import { PatientCardImproved } from "@/components/patient/PatientCardImproved";
import type { Patient } from "@/types";

interface PatientGridProps {
  patients: Patient[];
  expandedCard: string | null;
  onExpand: (id: string) => void;
  onPatientClick: (id: string) => void;
  onNewPatient: () => void;
  showAddCard?: boolean;
}

export function PatientGrid({
  patients,
  expandedCard,
  onExpand,
  onPatientClick,
  onNewPatient,
  showAddCard = false,
}: PatientGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {patients.map((patient) => (
        <PatientCardImproved
          key={patient.id}
          patient={patient}
          isExpanded={expandedCard === patient.id}
          onExpand={() => onExpand(patient.id)}
          onPatientClick={onPatientClick}
        />
      ))}

      {/* Add New Patient Card */}
      {showAddCard && (
        <button
          onClick={onNewPatient}
          className="group relative rounded-2xl p-10 border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-linear-to-br hover:from-teal-50 hover:to-teal-100/30 transition-all duration-300 flex flex-col items-center justify-center min-h-80 cursor-pointer"
          type="button"
        >
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 group-hover:from-teal-100 group-hover:to-teal-200 flex items-center justify-center text-slate-400 group-hover:text-teal-600 transition-all mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110">
            <span className="material-symbols-outlined text-5xl">add</span>
          </div>
          <span className="text-xl font-bold text-slate-700 group-hover:text-teal-600 transition-colors mb-2">
            Register New Patient
          </span>
          <p className="text-sm text-slate-500 text-center max-w-60 leading-relaxed">
            Start a new maternal care journey with AI-powered monitoring
          </p>
        </button>
      )}
    </div>
  );
}
