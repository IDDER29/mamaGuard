"use server";

// Edinburgh Postnatal Depression Scale (EPDS) screenings. Requires the
// `epds_screenings` table. Risk-flagged screenings also raise an alert.

import { createAdminClient } from "@/utils/supabase/admin";

export interface EpdsScreeningRow {
  id: string;
  patient_id: string;
  answers: number[];
  total_score: number;
  q10_score: number;
  risk_flag: boolean;
  notes: string | null;
  created_at: string;
}

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createEpdsScreening(input: {
  patientId: string;
  answers: number[];
  notes?: string;
  administeredBy?: string;
}): Promise<Result<{ id: string; total: number; riskFlag: boolean }>> {
  const { answers } = input;
  const validAnswers =
    Array.isArray(answers) &&
    answers.length === 10 &&
    answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3);
  if (!validAnswers) {
    return { success: false, error: "EPDS requires 10 answers scored 0-3" };
  }

  const total = answers.reduce((a, b) => a + b, 0);
  const q10 = answers[9];
  const riskFlag = total >= 10 || q10 > 0;

  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("epds_screenings")
    .insert({
      patient_id: input.patientId,
      answers,
      total_score: total,
      q10_score: q10,
      risk_flag: riskFlag,
      administered_by: input.administeredBy ?? null,
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createEpdsScreening]", error);
    return { success: false, error: error.message };
  }

  if (riskFlag) {
    const { error: alertError } = await supabase.from("alerts").insert({
      patient_id: input.patientId,
      urgency: q10 > 0 ? "critical" : "high",
      symptom_name: `EPDS screening: score ${total}/30${
        q10 > 0 ? " — self-harm item positive" : ""
      }`,
    });
    if (alertError) {
      console.error("[createEpdsScreening]", alertError);
    }
  }

  return { success: true, data: { id: data!.id, total, riskFlag } };
}

export async function listEpdsScreenings(
  patientId: string,
): Promise<EpdsScreeningRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("epds_screenings")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listEpdsScreenings]", error);
    return [];
  }
  return (data ?? []) as EpdsScreeningRow[];
}
