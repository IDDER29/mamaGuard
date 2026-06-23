-- Migration 0011 — Plan E4.1 hardening: role-aware RLS.
-- Trusted server writes use the service-role client (bypasses RLS); these
-- policies are defense-in-depth for any direct `authenticated` (browser) access.
-- Posture: clinical data stays readable/writable by all authenticated clinicians
-- (a triage helpdesk needs cross-patient visibility; CHW scoping is done in UI),
-- but the SENSITIVE admin tables (profiles, invites) are write-restricted to admins.

-- Helper: the current user's clinician role (security definer so it can read the
-- profiles table regardless of the caller's own row policies). Supabase provides auth.uid().
create or replace function public.current_clinician_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.clinician_profiles where user_id = auth.uid() limit 1;
$$;

-- clinician_profiles: everyone authenticated may read; only admins may write.
drop policy if exists "authenticated full access" on clinician_profiles;
drop policy if exists "profiles read" on clinician_profiles;
drop policy if exists "profiles admin write" on clinician_profiles;
create policy "profiles read" on clinician_profiles
  for select to authenticated using (true);
create policy "profiles admin write" on clinician_profiles
  for all to authenticated
  using (public.current_clinician_role() = 'admin')
  with check (public.current_clinician_role() = 'admin');

-- clinician_invites: read for authenticated; write admin-only.
drop policy if exists "authenticated full access" on clinician_invites;
drop policy if exists "invites read" on clinician_invites;
drop policy if exists "invites admin write" on clinician_invites;
create policy "invites read" on clinician_invites
  for select to authenticated using (true);
create policy "invites admin write" on clinician_invites
  for all to authenticated
  using (public.current_clinician_role() = 'admin')
  with check (public.current_clinician_role() = 'admin');
