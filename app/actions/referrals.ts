"use server";

// Plan 4.4 — referrals & facility directory. Requires the `facilities` and
// `referrals` tables.

import { createAdminClient } from "@/utils/supabase/admin";

export interface FacilityRow {
  id: string;
  name: string;
  type: string | null;
  region: string | null;
  city: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ReferralRow {
  id: string;
  patient_id: string;
  alert_id: string | null;
  facility_id: string | null;
  status: "created" | "en_route" | "arrived" | "completed" | "cancelled";
  reason: string | null;
  transport_note: string | null;
  created_at: string;
}

type Result<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createReferral(input: {
  patientId: string;
  alertId?: string | null;
  facilityId?: string | null;
  reason?: string;
  transportNote?: string;
  createdBy?: string;
}): Promise<Result<{ id: string }>> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      patient_id: input.patientId,
      alert_id: input.alertId ?? null,
      facility_id: input.facilityId ?? null,
      reason: input.reason ?? null,
      transport_note: input.transportNote ?? null,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createReferral]", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: { id: data!.id } };
}

export async function listReferrals(
  patientId: string,
): Promise<ReferralRow[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listReferrals]", error);
    return [];
  }
  return (data ?? []) as ReferralRow[];
}

export async function updateReferralStatus(
  referralId: string,
  status: ReferralRow["status"],
): Promise<Result> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("referrals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", referralId);
  if (error) {
    console.error("[updateReferralStatus]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function listFacilities(
  region?: string,
): Promise<FacilityRow[]> {
  const supabase = await createAdminClient();
  let query = supabase.from("facilities").select("*");
  if (region) {
    query = query.eq("region", region);
  }
  const { data, error } = await query.order("name", { ascending: true });
  if (error) {
    console.error("[listFacilities]", error);
    return [];
  }
  return (data ?? []) as FacilityRow[];
}

// Plan E4.3 — facility directory management (admin console).
export async function createFacility(input: {
  name: string;
  type?: string;
  region?: string;
  city?: string;
  phone?: string;
}): Promise<Result<{ id: string }>> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("facilities")
    .insert({
      name: input.name,
      type: input.type ?? null,
      region: input.region ?? null,
      city: input.city ?? null,
      phone: input.phone ?? null,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[createFacility]", error);
    return { success: false, error: error.message };
  }
  return { success: true, data: { id: data!.id } };
}

export async function deleteFacility(id: string): Promise<Result> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("facilities").delete().eq("id", id);
  if (error) {
    console.error("[deleteFacility]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
