"use server";

// Plan 1.2 — Human-in-the-loop alert workflow + audit trail.
// Clinicians acknowledge/resolve triage alerts; every action is written to the
// immutable audit_log. Uses the service-role admin client (trusted server write).
//
// NOTE: requires the alert workflow columns + audit_log table from schema.sql to
// exist in the database (run the migration before using in production).

import { createAdminClient } from "@/utils/supabase/admin";

type ActionResult = { success: true } | { success: false; error: string };

async function writeAudit(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  entry: {
    actor: string;
    action: string;
    entityType: string;
    entityId: string;
    patientId?: string | null;
    detail?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from("audit_log").insert({
    actor: entry.actor,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    patient_id: entry.patientId ?? null,
    detail: entry.detail ?? null,
  });
  if (error) console.error("[audit_log] write failed:", error.message);
}

export async function acknowledgeAlert(
  alertId: string,
  clinicianId: string,
  patientId?: string,
): Promise<ActionResult> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("alerts")
    .update({
      status: "acknowledged",
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: clinicianId,
      assigned_to: clinicianId,
    })
    .eq("id", alertId);

  if (error) {
    console.error("[acknowledgeAlert]", error);
    return { success: false, error: error.message };
  }

  await writeAudit(supabase, {
    actor: clinicianId,
    action: "alert.acknowledged",
    entityType: "alert",
    entityId: alertId,
    patientId,
  });
  return { success: true };
}

export async function resolveAlert(
  alertId: string,
  clinicianId: string,
  options?: { notes?: string; patientId?: string },
): Promise<ActionResult> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("alerts")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: clinicianId,
      doctor_notes: options?.notes ?? null,
    })
    .eq("id", alertId);

  if (error) {
    console.error("[resolveAlert]", error);
    return { success: false, error: error.message };
  }

  await writeAudit(supabase, {
    actor: clinicianId,
    action: "alert.resolved",
    entityType: "alert",
    entityId: alertId,
    patientId: options?.patientId,
    detail: options?.notes ? { notes: options.notes } : undefined,
  });
  return { success: true };
}
