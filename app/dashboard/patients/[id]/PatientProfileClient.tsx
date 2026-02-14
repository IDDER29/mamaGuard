"use client";

import { useRouter } from "next/navigation";
import {
  PatientActionBar,
  PatientHeader,
  VitalsCard,
  ClinicalHistory,
  VoiceTimeline,
  RiskTrendChart,
  EmergencyContactCard,
  AIRecommendation,
} from "@/components/patient";
import {
  mockVitals,
  mockClinicalHistory,
  mockVoiceMessages,
  mockRiskTrend,
} from "@/lib/mockPatientData";
import type { Patient } from "@/types";

interface PatientProfileClientProps {
  patient: Patient;
  patientId: string;
}

export function PatientProfileClient({ patient, patientId }: PatientProfileClientProps) {
  const router = useRouter();
  const displayName = patient.full_name ?? patient.name ?? "—";

  const handleMarkResolved = () => {
    console.log("Marking patient as resolved:", patientId);
    alert("Patient case marked as resolved");
  };

  const handleSchedule = () => {
    router.push(`/dashboard/patients/${patientId}/schedule`);
  };

  const handleEscalate = () => {
    if (
      confirm(
        `Escalate ${displayName} to emergency care?\n\nThis will alert the on-call physician immediately.`
      )
    ) {
      console.log("Escalating to emergency:", patientId);
      alert("Emergency escalation triggered. On-call physician notified.");
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.id)}`;

  const emergencyContact =
    patient.emergency_contact_name || patient.emergency_contact_phone
      ? {
          name: patient.emergency_contact_name ?? undefined,
          relationship: patient.emergency_contact_relation ?? undefined,
          phone: patient.emergency_contact_phone ?? undefined,
        }
      : null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <PatientActionBar
        patientName={displayName}
        patientId={patientId}
        onMarkResolved={handleMarkResolved}
        onSchedule={handleSchedule}
        onEscalate={handleEscalate}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <PatientHeader patient={patient} avatarUrl={avatarUrl} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pb-8">
            <aside
              className="lg:col-span-3 flex flex-col gap-4 sm:gap-6"
              aria-label="Patient vitals and history"
            >
              <VitalsCard vitals={mockVitals} />
              <ClinicalHistory history={mockClinicalHistory} />
            </aside>

            <section
              className="lg:col-span-6"
              aria-label="Voice symptom timeline"
            >
              <VoiceTimeline
                messages={mockVoiceMessages}
                patientAvatar={avatarUrl}
                patientName={displayName}
              />
            </section>

            <aside
              className="lg:col-span-3 flex flex-col gap-4 sm:gap-6"
              aria-label="Patient analytics and contacts"
            >
              <RiskTrendChart data={mockRiskTrend} />
              <EmergencyContactCard contact={emergencyContact} />
              <AIRecommendation recommendation="BP spike correlates with evening updates. Suggest monitoring evening diet and stress levels." />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
