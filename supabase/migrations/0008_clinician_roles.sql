-- Migration 0008 — Plan E4.1: clinician roles & profiles. Additive, idempotent.

create table if not exists clinician_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid unique,        -- auth.users id (null for seeded/demo rows)
  full_name          text,
  role               text not null default 'clinician'
                       check (role in ('chw','nurse','clinician','supervisor','admin','integration')),
  region             text,
  ui_language        text not null default 'en',
  notification_prefs jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_clinician_profiles_role on clinician_profiles (role);

alter table clinician_profiles enable row level security;
drop policy if exists "authenticated full access" on clinician_profiles;
create policy "authenticated full access" on clinician_profiles
  for all to authenticated using (true) with check (true);
