"use client"; // This can actually be a 'use server' file if placed in a separate actions folder

import { createClient } from "@/utils/supabase/client";

export async function registerPatientAction(formData: any) {
  const supabase = createClient();
  
  // 1. Format the phone number correctly
  const cleanPhone = formData.phone.replace(/\s+/g, '');
  const fullPhone = `${formData.countryCode}${cleanPhone}`.replace('+', '');

  // 2. Insert into Supabase
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert([{
      phone_number: fullPhone,
      full_name: formData.fullName,
      date_of_birth: formData.dateOfBirth,
      national_id: formData.nationalId,
      country_code: formData.countryCode,
      is_whatsapp: formData.isWhatsApp,
      alternative_phone: formData.alternativePhone,
      location_address: formData.location,
      gestational_week: formData.gestationalWeek,
      trimester: formData.trimester,
      last_menstrual_period: formData.lastMenstrualPeriod,
      due_date: formData.expectedDueDate,
      blood_type: formData.bloodType,
      previous_pregnancies: formData.previousPregnancies,
      medical_history: { notes: formData.medicalHistory },
      current_medications: formData.currentMedications,
      allergies: formData.allergies,
      emergency_contact_name: formData.emergencyContactName,
      emergency_contact_relation: formData.emergencyContactRelation,
      emergency_contact_phone: formData.emergencyContactPhone,
      spouse_partner_name: formData.spousePartnerName,
      spouse_partner_phone: formData.spousePartnerPhone,
      preferred_checkup_time: formData.preferredCheckupTime,
      voice_reporting_frequency: formData.voiceReportingFrequency,
      language: formData.languagePreference,
      has_smartphone: formData.hasSmartphone
    }])
    .select()
    .single();

  if (patientError) throw new Error(patientError.message);

  // 3. Send Personalized Welcome Message via WhatsApp
  const welcomeMessage = `Salam ${formData.fullName}! 🧸 
Ana Mama AI, l-moussa3ida dyalk f l-7aml. Dr. Emily Chen tsjlatk m3ana l-youm.
Nti daba f l-osbou3 ${formData.gestational_week}. Ghadi nbqa nti3lk l-akhbar dima bach n-t'amno 3lik. 
Ila 7ssiti b chi haja, goliha liya hna! 🇲🇦`;

  const waRes = await fetch("/api/whatsapp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: fullPhone,
      message: welcomeMessage
    }),
  });

  return { success: true, patient };
}