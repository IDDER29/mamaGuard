"use server";

// Plan E4.3 — audit log reader for the admin console. Admin-gated.

import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentProfile } from "@/app/actions/profiles";

export interface AuditRow {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  patient_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export async function listAuditLog(limit = 100): Promise<AuditRow[]> {
  const me = await getCurrentProfile();
  if (me.role !== "admin" && me.role !== "supervisor") return [];
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listAuditLog]", error);
    return [];
  }
  return (data ?? []) as AuditRow[];
}
