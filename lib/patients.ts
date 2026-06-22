import type { Patient, PatientManagementCard } from "@/types";

/** Supabase returns snake_case; ensure we have a Patient-shaped object. */
export function normalizePatient(row: Record<string, unknown>): Patient {
  return {
    id: String(row.id ?? ""),
    phone_number: String(row.phone_number ?? ""),
    full_name: row.full_name != null ? String(row.full_name) : null,
    name: String(row.name ?? row.full_name ?? ""),
    due_date: row.due_date != null ? String(row.due_date) : null,
    gestational_week: Number(row.gestational_week) || 0,
    risk_level: ["low", "medium", "high", "critical"].includes(String(row.risk_level))
      ? (row.risk_level as Patient["risk_level"])
      : "low",
    language: String(row.language ?? "darija"),
    medical_history:
      row.medical_history != null && typeof row.medical_history === "object"
        ? (row.medical_history as Patient["medical_history"])
        : null,
    created_at: String(row.created_at ?? ""),
    date_of_birth: row.date_of_birth != null ? String(row.date_of_birth) : null,
    national_id: row.national_id != null ? String(row.national_id) : null,
    location_address: row.location_address != null ? String(row.location_address) : null,
    trimester:
      row.trimester != null && [1, 2, 3].includes(Number(row.trimester))
        ? (Number(row.trimester) as 1 | 2 | 3)
        : null,
    blood_type: row.blood_type != null ? String(row.blood_type) : null,
    previous_pregnancies: Number(row.previous_pregnancies) || 0,
    current_medications: row.current_medications != null ? String(row.current_medications) : null,
    allergies: row.allergies != null ? String(row.allergies) : null,
    emergency_contact_name:
      row.emergency_contact_name != null ? String(row.emergency_contact_name) : null,
    emergency_contact_relation:
      row.emergency_contact_relation != null ? String(row.emergency_contact_relation) : null,
    emergency_contact_phone:
      row.emergency_contact_phone != null ? String(row.emergency_contact_phone) : null,
    spouse_partner_name:
      row.spouse_partner_name != null ? String(row.spouse_partner_name) : null,
    spouse_partner_phone:
      row.spouse_partner_phone != null ? String(row.spouse_partner_phone) : null,
    partner_opt_in: Boolean(row.partner_opt_in),
    preferred_checkup_time:
      row.preferred_checkup_time != null ? String(row.preferred_checkup_time) : null,
    has_smartphone: Boolean(row.has_smartphone),
    postpartum: Boolean(row.postpartum),
    delivery_date: row.delivery_date != null ? String(row.delivery_date) : null,
    consent_given: Boolean(row.consent_given),
    consent_at: row.consent_at != null ? String(row.consent_at) : null,
    consent_version: row.consent_version != null ? String(row.consent_version) : null,
    data_retention_until:
      row.data_retention_until != null ? String(row.data_retention_until) : null,
    preferred_channel: ["whatsapp", "sms", "ussd", "voice"].includes(String(row.preferred_channel))
      ? (row.preferred_channel as Patient["preferred_channel"])
      : "whatsapp",
  };
}

function ageFromDob(dob: string | null): number {
  if (!dob) return 0;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

/**
 * Map Supabase patient (snake_case) to PatientManagementCard for UI that expects it.
 * Risk: critical/high -> high-risk, medium -> monitor, low -> stable.
 * Overdue: due_date in the past.
 */
export function mapPatientToManagementCard(patient: Patient): PatientManagementCard {
  const name = patient.full_name ?? patient.name ?? "—";
  const status: PatientManagementCard["status"] =
    patient.risk_level === "critical" || patient.risk_level === "high"
      ? "high-risk"
      : patient.risk_level === "medium"
        ? "monitor"
        : "stable";
  const dueDate = patient.due_date ? new Date(patient.due_date) : null;
  const isOverdue = dueDate != null && dueDate < new Date();
  const progressPercent = Math.min(Math.round((patient.gestational_week / 40) * 100), 100);

  return {
    id: patient.id,
    patientId: patient.id,
    name,
    age: ageFromDob(patient.date_of_birth),
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.id)}`,
    initials: name.slice(0, 2).toUpperCase(),
    status: isOverdue ? "due-soon" : status,
    gestationalWeek: patient.gestational_week,
    trimester: (patient.trimester ?? 1) as 1 | 2 | 3,
    aiAnalysis: patient.medical_history?.notes ?? "No notes recorded.",
    phone: patient.phone_number || undefined,
    isOverdue,
    assignedCareTeam: [],
    progressPercent,
  };
}
