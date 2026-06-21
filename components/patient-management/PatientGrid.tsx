"use client";

import { UserPlus } from "lucide-react";
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
          className="group relative rounded-2xl p-10 border-2 border-dashed border-slate-300 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-cyan-100/20 transition-all duration-300 flex flex-col items-center justify-center min-h-80 cursor-pointer"
          type="button"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-primary/15 group-hover:to-cyan-200/40 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all mb-5 shadow-lg group-hover:shadow-glow group-hover:scale-105">
            <UserPlus className="h-9 w-9" />
          </div>
          <span className="text-xl font-semibold text-slate-700 group-hover:text-primary transition-colors mb-2">
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
