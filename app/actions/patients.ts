"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { buildImmunizationAppointments } from "@/lib/immunization";

export type PatientFormData = {
  fullName: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  countryCode: string;
  isWhatsApp: boolean;
  alternativePhone: string;
  location: string;
  gestationalWeek: number;
  trimester: 1 | 2 | 3;
  lastMenstrualPeriod: string;
  expectedDueDate: string;
  bloodType: string;
  previousPregnancies: number;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  spousePartnerName: string;
  spousePartnerPhone: string;
  preferredCheckupTime: string;
  voiceReportingFrequency: string;
  languagePreference: string;
  hasSmartphone: boolean;
  consentGiven?: boolean;
};

/** Consent text version recorded with each patient (Plan 1.3). Bump when wording changes. */
const CONSENT_VERSION = "v1-2026-06";

function formatPhone(countryCode: string, phone: string): string {
  const combined = `${countryCode}${phone}`.replace(/\s/g, "");
  return combined.startsWith("+") ? combined : `+${combined}`;
}

/** Map form label to PostgreSQL TIME. Column is type time, not text. */
function mapCheckupTimeToTime(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const v = value.trim().toLowerCase();
  if (v === "morning") return "09:00:00";
  if (v === "afternoon") return "14:00:00";
  if (v === "evening") return "17:30:00";
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(v)) return v.length === 5 ? `${v}:00` : v;
  return null;
}

/** Personalized welcome in Moroccan Darija mentioning name and gestational week.
 *  Includes a clinical safety disclaimer (Plan 1.2): danger signs -> seek care now. */
function buildWelcomeMessage(fullName: string, gestationalWeek: number): string {
  const name = fullName?.trim() || "l-mama";
  return `Salam ${name}! 🧸 Ana Mama AI, l-moussa3ida dyalk f l-7aml. Tsjalti m3ana l-youm. Nti daba f l-osbou3 ${gestationalWeek}. Ghadi nbqa nti3lk l-akhbar dima bach n-t'amno 3lik. Ila 7ssiti b chi haja, goliha liya hna! 🇲🇦

⚠️ Mouhim: ana machi 3iwad 3la tbib. Ila 7ssiti b chi 3arad khatir bhal nazif (dem), sda3 qwi bezzaf, l-bsar mcha-wach, chi tachannoj, wla l-bebe ma bqach kaytharrak — sir l-aqrab sbitar daba wla 3ayyti l-ist3ajalat.`;
}

export type RegisterPatientResult =
  | { success: true; patientId: string }
  | { success: false; error: string };

export async function registerPatient(
  formData: PatientFormData
): Promise<RegisterPatientResult> {
  const supabase = await createAdminClient();

  const phoneNumber = formatPhone(formData.countryCode, formData.phone);

  const patientRow = {
    phone_number: phoneNumber,
    name: formData.fullName || null,
    full_name: formData.fullName || null,
    date_of_birth: formData.dateOfBirth || null,
    national_id: formData.nationalId || null,
    country_code: formData.countryCode || "+212",
    is_whatsapp: formData.isWhatsApp ?? true,
    alternative_phone: formData.alternativePhone || null,
    location_address: formData.location || null,
    gestational_week: formData.gestationalWeek || 1,
    trimester: formData.trimester || null,
    last_menstrual_period: formData.lastMenstrualPeriod || null,
    due_date: formData.expectedDueDate || null,
    blood_type: formData.bloodType || null,
    previous_pregnancies: formData.previousPregnancies ?? 0,
    medical_history:
      formData.medicalHistory != null && formData.medicalHistory !== ""
        ? { notes: formData.medicalHistory }
        : null,
    current_medications: formData.currentMedications || null,
    allergies: formData.allergies || null,
    emergency_contact_name: formData.emergencyContactName || null,
    emergency_contact_relation: formData.emergencyContactRelation || null,
    emergency_contact_phone: formData.emergencyContactPhone || null,
    spouse_partner_name: formData.spousePartnerName || null,
    spouse_partner_phone: formData.spousePartnerPhone || null,
    preferred_checkup_time: mapCheckupTimeToTime(formData.preferredCheckupTime),
    voice_reporting_frequency: formData.voiceReportingFrequency || null,
    language: formData.languagePreference || "darija",
    has_smartphone: formData.hasSmartphone ?? true,
    // Consent captured at onboarding (Plan 1.3).
    consent_given: formData.consentGiven ?? true,
    consent_at: new Date().toISOString(),
    consent_version: CONSENT_VERSION,
    // Channel preference (Plan 2.2): no smartphone -> SMS fallback.
    preferred_channel: formData.hasSmartphone === false ? "sms" : "whatsapp",
  };

  const { data: patient, error: insertError } = await supabase
    .from("patients")
    .insert(patientRow)
    .select("id")
    .single();

  if (insertError) {
    console.error("[registerPatient] Insert error:", insertError);
    return { success: false, error: insertError.message };
  }

  const patientId = patient?.id;
  if (!patientId) {
    return { success: false, error: "Insert succeeded but no patient id returned." };
  }

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (phoneId && token) {
    const welcomeText = buildWelcomeMessage(
      formData.fullName,
      formData.gestationalWeek || 1
    );
    const toNumber = phoneNumber.replace(/\D/g, "");
    try {
      const waRes = await fetch(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: toNumber,
            type: "text",
            text: { body: welcomeText },
          }),
        }
      );
      if (!waRes.ok) {
        const err = await waRes.json().catch(() => ({}));
        console.error("[registerPatient] WhatsApp welcome failed:", waRes.status, err);
      }
    } catch (waErr) {
      console.error("[registerPatient] WhatsApp request failed:", waErr);
    }
  }

  return { success: true, patientId };
}

export type UpdatePatientFieldsInput = {
  gestational_week?: number;
  blood_type?: string | null;
  due_date?: string | null;
  allergies?: string | null;
};

export async function updatePatientFields(
  patientId: string,
  fields: UpdatePatientFieldsInput
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createAdminClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.gestational_week !== undefined) payload.gestational_week = fields.gestational_week;
  if (fields.blood_type !== undefined) payload.blood_type = fields.blood_type || null;
  if (fields.due_date !== undefined) payload.due_date = fields.due_date || null;
  if (fields.allergies !== undefined) payload.allergies = fields.allergies || null;

  const { error } = await supabase.from("patients").update(payload).eq("id", patientId);
  if (error) {
    console.error("[updatePatientFields]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Plan 2.4 — partner / family engagement. The clinician records a trusted
// partner and the mother's consent; on a critical escalation the webhook
// notifies the partner so family can help her reach care.
export type UpdatePartnerInfoInput = {
  spouse_partner_name?: string | null;
  spouse_partner_phone?: string | null;
  partner_opt_in?: boolean;
};

export async function updatePartnerInfo(
  patientId: string,
  fields: UpdatePartnerInfoInput
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createAdminClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.spouse_partner_name !== undefined)
    payload.spouse_partner_name = fields.spouse_partner_name || null;
  if (fields.spouse_partner_phone !== undefined)
    payload.spouse_partner_phone = fields.spouse_partner_phone || null;
  if (fields.partner_opt_in !== undefined) payload.partner_opt_in = fields.partner_opt_in;

  const { error } = await supabase.from("patients").update(payload).eq("id", patientId);
  if (error) {
    console.error("[updatePartnerInfo]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Plan 4.1 — assign / unassign a community health worker (auth user id) to a
// patient. Pass null to unassign.
export async function assignChw(
  patientId: string,
  chwId: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("patients")
    .update({ assigned_chw: chwId, updated_at: new Date().toISOString() })
    .eq("id", patientId);
  if (error) {
    console.error("[assignChw]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Phase 3 — postpartum mode. Flips the patient to postpartum so triage uses
// postpartum danger signs and the assistant uses postpartum guidance.
export async function setPostpartumStatus(
  patientId: string,
  fields: { postpartum: boolean; delivery_date?: string | null }
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createAdminClient();
  const payload: Record<string, unknown> = {
    postpartum: fields.postpartum,
    updated_at: new Date().toISOString(),
  };
  if (fields.delivery_date !== undefined) payload.delivery_date = fields.delivery_date || null;

  const { error } = await supabase.from("patients").update(payload).eq("id", patientId);
  if (error) {
    console.error("[setPostpartumStatus]", error);
    return { success: false, error: error.message };
  }

  // On postpartum activation with a delivery date, schedule the newborn
  // immunization calendar once (idempotent). The reminder cron handles nudges.
  if (fields.postpartum && fields.delivery_date) {
    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("type", "immunization");
    if (!count) {
      const rows = buildImmunizationAppointments(patientId, fields.delivery_date);
      if (rows.length) {
        const { error: immErr } = await supabase.from("appointments").insert(rows);
        if (immErr) console.error("[setPostpartumStatus] immunization seed", immErr);
      }
    }
  }
  return { success: true };
}
