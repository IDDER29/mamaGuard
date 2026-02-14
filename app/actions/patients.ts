"use server";

import { createClient } from "@/utils/supabase/server";

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
};

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

/** Personalized welcome in Moroccan Darija mentioning name and gestational week. */
function buildWelcomeMessage(fullName: string, gestationalWeek: number): string {
  const name = fullName?.trim() || "l-mama";
  return `Salam ${name}! 🧸 Ana Mama AI, l-moussa3ida dyalk f l-7aml. Tsjalti m3ana l-youm. Nti daba f l-osbou3 ${gestationalWeek}. Ghadi nbqa nti3lk l-akhbar dima bach n-t'amno 3lik. Ila 7ssiti b chi haja, goliha liya hna! 🇲🇦`;
}

export type RegisterPatientResult =
  | { success: true; patientId: string }
  | { success: false; error: string };

export async function registerPatient(
  formData: PatientFormData
): Promise<RegisterPatientResult> {
  const supabase = await createClient();

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
  const supabase = await createClient();
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
