import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerAnonClient } from "./server";

/**
 * Server-side Supabase client for trusted, sessionless writes (WhatsApp webhook,
 * cron jobs, server actions). When `SUPABASE_SERVICE_ROLE_KEY` is set it uses the
 * service role, which bypasses Row Level Security — required once RLS is enabled.
 *
 * If the service key is absent it falls back to the cookie-based anon server
 * client, preserving today's behavior while RLS is still permissive. Set the key
 * in production so server writes keep working after RLS is locked down.
 *
 * NEVER import this into client components — the service key must stay server-only.
 */
export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (serviceKey) {
    return createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createServerAnonClient();
}
