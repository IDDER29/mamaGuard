"use server";

// Plan E4.2 — clinician invites. Admin creates an invite (email + role) and
// shares the accept link; the invited clinician signs in and accepts, which
// provisions their profile with the assigned role.

import { randomUUID } from "node:crypto";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentProfile } from "@/app/actions/profiles";
import type { Role } from "@/lib/roles";

export interface InviteRow {
  id: string;
  email: string;
  role: Role;
  token: string;
  accepted_at: string | null;
  created_at: string;
}

export async function createInvite(
  email: string,
  role: Role,
): Promise<{ success: true; token: string } | { success: false; error: string }> {
  const me = await getCurrentProfile();
  if (me.role !== "admin") return { success: false, error: "Admins only." };
  if (!email.trim()) return { success: false, error: "Email required." };
  const admin = await createAdminClient();
  const token = randomUUID();
  const { error } = await admin
    .from("clinician_invites")
    .insert({ email: email.trim().toLowerCase(), role, token });
  if (error) {
    console.error("[createInvite]", error);
    return { success: false, error: error.message };
  }
  return { success: true, token };
}

export async function listInvites(): Promise<InviteRow[]> {
  const me = await getCurrentProfile();
  if (me.role !== "admin") return [];
  const admin = await createAdminClient();
  const { data } = await admin
    .from("clinician_invites")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as InviteRow[];
}

/** The invited clinician (signed in) accepts: provisions their profile + role. */
export async function acceptInvite(
  token: string,
): Promise<{ success: true; role: Role } | { success: false; error: string }> {
  const server = await createClient();
  const { data: auth } = await server.auth.getUser();
  if (!auth.user) return { success: false, error: "Sign in first, then open the invite link." };

  const admin = await createAdminClient();
  const { data: invite } = await admin
    .from("clinician_invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .maybeSingle();
  if (!invite) return { success: false, error: "Invite is invalid or already used." };

  const role = invite.role as Role;
  // Upsert the clinician's profile with the assigned role.
  const { data: existing } = await admin
    .from("clinician_profiles")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (existing) {
    await admin.from("clinician_profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await admin.from("clinician_profiles").insert({
      user_id: auth.user.id,
      full_name: auth.user.email ?? invite.email,
      role,
    });
  }
  await admin.from("clinician_invites").update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);
  return { success: true, role };
}
