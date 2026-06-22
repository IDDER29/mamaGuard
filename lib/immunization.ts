// lib/immunization.ts
// Plan 3 (postpartum) — Morocco national immunization programme (PNI / EPI)
// schedule for the newborn. Reused through the `appointments` table (type
// "immunization") so the existing reminder cron delivers the WhatsApp nudges.

export interface ImmunizationMilestone {
  /** Weeks after birth. */
  weeks: number;
  /** Vaccine label (French/Darija) shown to the mother. */
  label: string;
}

// Aligned with Morocco's PNI / WHO EPI schedule (BCG/HepB/Polio at birth; Penta
// at 6/10/14 weeks; measles-rubella at 9 and 18 months).
export const MOROCCO_EPI: ImmunizationMilestone[] = [
  { weeks: 0, label: "BCG + VPO-0 + Hépatite B (à la naissance)" },
  { weeks: 6, label: "Penta-1 + VPO-1 + Pneumo-1 + Rota-1 (6 semaines)" },
  { weeks: 10, label: "Penta-2 + VPO-2 + Pneumo-2 + Rota-2 (10 semaines)" },
  { weeks: 14, label: "Penta-3 + VPI + Pneumo-3 (14 semaines)" },
  { weeks: 39, label: "Rougeole-Rubéole RR-1 (9 mois)" },
  { weeks: 78, label: "RR-2 + Rappel DTC + VPO (18 mois)" },
];

export interface ImmunizationAppointment {
  patient_id: string;
  scheduled_at: string;
  type: "immunization";
  location: string;
  notes: string;
}

/** Build immunization appointment rows from a delivery date. Empty if invalid. */
export function buildImmunizationAppointments(
  patientId: string,
  deliveryDate: string,
): ImmunizationAppointment[] {
  const base = new Date(deliveryDate);
  if (Number.isNaN(base.getTime())) return [];
  return MOROCCO_EPI.map((m) => {
    const d = new Date(base);
    d.setDate(d.getDate() + m.weeks * 7);
    return {
      patient_id: patientId,
      scheduled_at: d.toISOString(),
      type: "immunization" as const,
      location: "Centre de santé",
      notes: m.label,
    };
  });
}
