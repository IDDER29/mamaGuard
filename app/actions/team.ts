"use server";

// Plan E4.4 — supervisor team views + reassignment. Supervisor/admin only.

import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentProfile } from "@/app/actions/profiles";

export interface TeamMember {
  id: string;
  user_id: string | null;
  full_name: string | null;
  role: string;
  region: string | null;
  patient_count: number;
  open_alerts: number;
}

type Result = { success: true } | { success: false; error: string };

async function requireSupervisor(): Promise<boolean> {
  const me = await getCurrentProfile();
  return me.role === "supervisor" || me.role === "admin";
}

export async function listTeam(): Promise<TeamMember[]> {
  if (!(await requireSupervisor())) return [];
  const supabase = await createAdminClient();
  const [{ data: staff }, { data: patients }, { data: alerts }] = await Promise.all([
    supabase.from("clinician_profiles").select("id, user_id, full_name, role, region"),
    supabase.from("patients").select("assigned_chw"),
    supabase.from("alerts").select("assigned_to").in("status", ["active", "acknowledged"]),
  ]);

  const pCount = new Map<string, number>();
  for (const p of patients ?? []) {
    const k = (p as { assigned_chw: string | null }).assigned_chw;
    if (k) pCount.set(k, (pCount.get(k) ?? 0) + 1);
  }
  const aCount = new Map<string, number>();
  for (const a of alerts ?? []) {
    const k = (a as { assigned_to: string | null }).assigned_to;
    if (k) aCount.set(k, (aCount.get(k) ?? 0) + 1);
  }

  return (staff ?? []).map((s) => {
    const m = s as { id: string; user_id: string | null; full_name: string | null; role: string; region: string | null };
    return {
      ...m,
      patient_count: m.user_id ? pCount.get(m.user_id) ?? 0 : 0,
      open_alerts: m.user_id ? aCount.get(m.user_id) ?? 0 : 0,
    };
  });
}

/** Reassign a patient's CHW (by clinician user_id). */
export async function reassignPatient(patientId: string, chwUserId: string | null): Promise<Result> {
  if (!(await requireSupervisor())) return { success: false, error: "Supervisors only." };
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("patients")
    .update({ assigned_chw: chwUserId, updated_at: new Date().toISOString() })
    .eq("id", patientId);
  if (error) {
    console.error("[reassignPatient]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/** Reassign an alert's owner (by clinician user_id). */
export async function reassignAlert(alertId: string, ownerUserId: string | null): Promise<Result> {
  if (!(await requireSupervisor())) return { success: false, error: "Supervisors only." };
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("alerts")
    .update({ assigned_to: ownerUserId })
    .eq("id", alertId);
  if (error) {
    console.error("[reassignAlert]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
