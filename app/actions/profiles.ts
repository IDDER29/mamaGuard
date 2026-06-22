"use server";

// Plan E4.1 — clinician profiles & roles. Auth identity comes from the cookie
// session (server client); reads/writes use the admin client. In DISABLE_AUTH
// demo mode there is no session, so we return a synthetic admin profile.

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Role } from "@/lib/roles";

export interface ClinicianProfile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  role: Role;
  region: string | null;
  ui_language: string;
}

const DEMO_PROFILE: ClinicianProfile = {
  id: "demo",
  user_id: null,
  full_name: "Demo Clinician",
  role: "admin",
  region: null,
  ui_language: "en",
};

async function currentUserId(): Promise<{ id: string; email?: string } | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : null;
  } catch {
    return null;
  }
}

/** Resolve the signed-in clinician's profile, creating a default on first login. */
export async function getCurrentProfile(): Promise<ClinicianProfile> {
  const user = await currentUserId();
  if (!user) return DEMO_PROFILE; // demo / unauthenticated

  const admin = await createAdminClient();
  const { data: existing } = await admin
    .from("clinician_profiles")
    .select("id, user_id, full_name, role, region, ui_language")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return existing as ClinicianProfile;

  const { data: created, error } = await admin
    .from("clinician_profiles")
    .insert({ user_id: user.id, full_name: user.email ?? null, role: "clinician" })
    .select("id, user_id, full_name, role, region, ui_language")
    .single();
  if (error || !created) {
    console.error("[getCurrentProfile] create", error);
    return { ...DEMO_PROFILE, role: "clinician", full_name: user.email ?? null };
  }
  return created as ClinicianProfile;
}

export async function updateMyProfile(fields: {
  full_name?: string | null;
  region?: string | null;
  ui_language?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await currentUserId();
  if (!user) return { success: false, error: "Not signed in (demo mode)." };
  const admin = await createAdminClient();
  const { error } = await admin
    .from("clinician_profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);
  if (error) {
    console.error("[updateMyProfile]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function listStaff(): Promise<ClinicianProfile[]> {
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("clinician_profiles")
    .select("id, user_id, full_name, role, region, ui_language")
    .order("full_name", { ascending: true });
  if (error) {
    console.error("[listStaff]", error);
    return [];
  }
  return (data ?? []) as ClinicianProfile[];
}

/** Admin-only: change a profile's role. */
export async function setRole(
  profileId: string,
  role: Role,
): Promise<{ success: boolean; error?: string }> {
  const me = await getCurrentProfile();
  if (me.role !== "admin") return { success: false, error: "Admins only." };
  const admin = await createAdminClient();
  const { error } = await admin
    .from("clinician_profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  if (error) {
    console.error("[setRole]", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
