import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Accesses the NEXT_PUBLIC keys from your .env automatically
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}