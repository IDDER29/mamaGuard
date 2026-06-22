"use server";

// Plan E6.4 — merge a duplicate patient (e.g. same mother on a second number)
// into a primary record. Admin-only. Consolidates conversations so the primary
// ends with exactly ONE conversation (the webhook assumes <=1 per patient),
// repoints all other child rows, records the duplicate's number as an identifier,
// then deletes the now-empty duplicate. Irreversible — audited.

import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentProfile } from "@/app/actions/profiles";

type Result = { success: true } | { success: false; error: string };

// Tables that carry a patient_id we simply repoint to the primary.
const REPOINT_TABLES = [
  "alerts",
  "appointments",
  "vitals",
  "epds_screenings",
  "referrals",
  "notifications",
  "message_deliveries",
  "patient_identifiers",
  "audit_log",
] as const;

export async function mergePatients(primaryId: string, duplicateId: string): Promise<Result> {
  if (primaryId === duplicateId) return { success: false, error: "Cannot merge a patient into itself." };
  const me = await getCurrentProfile();
  if (me.role !== "admin") return { success: false, error: "Admins only." };
  const supabase = await createAdminClient();

  // Snapshot the duplicate (for its phone + audit) before deletion.
  const { data: dup } = await supabase
    .from("patients")
    .select("id, phone_number")
    .eq("id", duplicateId)
    .maybeSingle();
  if (!dup) return { success: false, error: "Duplicate patient not found." };

  // 1. Repoint the duplicate's conversations to the primary.
  await supabase.from("conversations").update({ patient_id: primaryId }).eq("patient_id", duplicateId);

  // 2. Consolidate to a single primary conversation.
  const { data: convs } = await supabase
    .from("conversations")
    .select("id, created_at")
    .eq("patient_id", primaryId)
    .order("created_at", { ascending: true });
  if (convs && convs.length > 1) {
    const canonical = convs[0].id;
    const extras = convs.slice(1).map((c) => c.id);
    await supabase.from("messages").update({ conversation_id: canonical }).in("conversation_id", extras);
    await supabase.from("conversations").delete().in("id", extras);
  }

  // 3. Repoint all other child rows.
  for (const table of REPOINT_TABLES) {
    const { error } = await supabase.from(table).update({ patient_id: primaryId }).eq("patient_id", duplicateId);
    if (error) console.error(`[mergePatients] repoint ${table}`, error);
  }

  // 4. Record the duplicate's number as an identifier of the primary (best-effort).
  if (dup.phone_number) {
    await supabase
      .from("patient_identifiers")
      .insert({ patient_id: primaryId, channel: "whatsapp", value: dup.phone_number })
      .select("id")
      .maybeSingle();
  }

  // 5. Audit, then delete the duplicate.
  await supabase.from("audit_log").insert({
    actor: me.full_name ?? me.user_id ?? "admin",
    action: "patient.merged",
    entity_type: "patient",
    entity_id: duplicateId,
    patient_id: primaryId,
    detail: { merged_phone: dup.phone_number },
  });

  const { error: delErr } = await supabase.from("patients").delete().eq("id", duplicateId);
  if (delErr) {
    console.error("[mergePatients] delete duplicate", delErr);
    return { success: false, error: delErr.message };
  }
  return { success: true };
}
