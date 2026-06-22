"use server";

// Dashboard read actions via the service-role admin client. Using the admin
// client (not the browser anon client) means these power the alerts queue, CHW
// worklist, and analytics in BOTH authenticated and DISABLE_AUTH demo mode,
// without depending on anon RLS policies. /dashboard is already auth-gated by
// proxy.ts (open only when DISABLE_AUTH=true).

import { createAdminClient } from "@/utils/supabase/admin";
import { normalizePatient } from "@/lib/patients";
import type { Patient } from "@/types";

interface JoinedPatient {
  full_name: string | null;
  name: string | null;
  phone_number: string | null;
  assigned_chw: string | null;
}

export interface DashboardAlert {
  id: string;
  patient_id: string;
  urgency: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  symptom_name: string | null;
  created_at: string;
  patients: JoinedPatient | null;
}

export interface WorklistVisit {
  id: string;
  patient_id: string;
  scheduled_at: string;
  location: string | null;
  patients: JoinedPatient | null;
}

export async function listActiveAlerts(): Promise<DashboardAlert[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("id, patient_id, urgency, status, symptom_name, created_at, patients(full_name, name, phone_number, assigned_chw)")
    .in("status", ["active", "acknowledged"])
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listActiveAlerts]", error);
    return [];
  }
  return (data ?? []) as unknown as DashboardAlert[];
}

export async function listWorklist(): Promise<{
  alerts: DashboardAlert[];
  visits: WorklistVisit[];
}> {
  const supabase = await createAdminClient();
  const nowIso = new Date().toISOString();
  const [alertsRes, visitsRes] = await Promise.all([
    supabase
      .from("alerts")
      .select("id, patient_id, urgency, status, symptom_name, created_at, patients(full_name, name, phone_number, assigned_chw)")
      .in("status", ["active", "acknowledged"])
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("id, patient_id, scheduled_at, location, patients(full_name, name, phone_number, assigned_chw)")
      .in("status", ["scheduled", "confirmed"])
      .lt("scheduled_at", nowIso)
      .order("scheduled_at", { ascending: true }),
  ]);
  if (alertsRes.error) console.error("[listWorklist alerts]", alertsRes.error);
  if (visitsRes.error) console.error("[listWorklist visits]", visitsRes.error);
  return {
    alerts: (alertsRes.data ?? []) as unknown as DashboardAlert[],
    visits: (visitsRes.data ?? []) as unknown as WorklistVisit[],
  };
}

export async function listAllPatients(): Promise<Patient[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listAllPatients]", error);
    return [];
  }
  return (data ?? []).map((row) => normalizePatient(row as Record<string, unknown>));
}
