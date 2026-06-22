"use server";

// Patient vitals recording (blood pressure, heart rate, temperature, weight).
// Requires the `vitals` table (created elsewhere). Elevated BP readings also
// raise an `alerts` row to flag pre-eclampsia concern.

import { createAdminClient } from "@/utils/supabase/admin";

export interface VitalRow {
  id: string;
  patient_id: string;
  recorded_at: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  weight_kg: number | null;
  notes: string | null;
}

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function recordVital(input: {
  patientId: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  weightKg?: number;
  notes?: string;
  recordedBy?: string;
}): Promise<Result<{ id: string }>> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("vitals")
    .insert({
      patient_id: input.patientId,
      systolic: input.systolic ?? null,
      diastolic: input.diastolic ?? null,
      heart_rate: input.heartRate ?? null,
      temperature: input.temperature ?? null,
      weight_kg: input.weightKg ?? null,
      notes: input.notes ?? null,
      recorded_by: input.recordedBy ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[recordVital]", error);
    return { success: false, error: error.message };
  }

  if (
    input.systolic != null &&
    input.diastolic != null &&
    (input.systolic >= 140 || input.diastolic >= 90)
  ) {
    const { error: alertError } = await supabase.from("alerts").insert({
      patient_id: input.patientId,
      urgency:
        input.systolic >= 160 || input.diastolic >= 110 ? "critical" : "high",
      symptom_name: `Elevated BP ${input.systolic}/${input.diastolic} — pre-eclampsia concern`,
    });
    if (alertError) {
      console.error("[recordVital]", alertError);
    }
  }

  return { success: true, data: { id: data!.id } };
}

export async function listVitals(patientId: string): Promise<VitalRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("vitals")
    .select("*")
    .eq("patient_id", patientId)
    .order("recorded_at", { ascending: true });
  if (error) {
    console.error("[listVitals]", error);
    return [];
  }
  return (data ?? []) as VitalRow[];
}
