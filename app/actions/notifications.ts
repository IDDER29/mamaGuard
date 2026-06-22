"use server";

// Plan E1.1 — clinician notification reads/marks (admin client so they work in
// demo + authenticated mode, like app/actions/dashboard.ts). Writes are made by
// the webhook (on alert) and the SLA cron.

import { createAdminClient } from "@/utils/supabase/admin";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  patient_id: string | null;
  read_at: string | null;
  created_at: string;
}

export async function listNotifications(limit = 30): Promise<NotificationRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listNotifications]", error);
    return [];
  }
  return (data ?? []) as NotificationRow[];
}

export async function markNotificationRead(
  id: string,
): Promise<{ success: boolean }> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) console.error("[markNotificationRead]", error);
  return { success: !error };
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) console.error("[markAllNotificationsRead]", error);
  return { success: !error };
}
