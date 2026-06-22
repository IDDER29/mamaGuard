"use server";

// Plan 2.1 — ANC appointment scheduling. Reminders are sent by the cron route
// app/api/cron/reminders. Requires the `appointments` table (migration 0001).

import { createAdminClient } from "@/utils/supabase/admin";

export interface AppointmentRow {
  id: string;
  patient_id: string;
  scheduled_at: string;
  type: string | null;
  location: string | null;
  status: "scheduled" | "confirmed" | "completed" | "missed" | "cancelled";
  reminder_sent_at: string | null;
  notes: string | null;
  meeting_url: string | null;
  created_at: string;
}

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createAppointment(input: {
  patientId: string;
  scheduledAt: string; // ISO
  type?: string;
  location?: string;
  notes?: string;
  meetingUrl?: string;
}): Promise<Result<{ id: string }>> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: input.patientId,
      scheduled_at: input.scheduledAt,
      type: input.type ?? "anc_visit",
      location: input.location ?? null,
      notes: input.notes ?? null,
      meeting_url: input.meetingUrl ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createAppointment]", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: { id: data!.id } };
}

export async function listAppointments(
  patientId: string,
): Promise<AppointmentRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("scheduled_at", { ascending: true });
  if (error) {
    console.error("[listAppointments]", error);
    return [];
  }
  return (data ?? []) as AppointmentRow[];
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentRow["status"],
): Promise<Result> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) {
    console.error("[updateAppointmentStatus]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
