-- Migration 0001 — activate Phase 1.2 (alert workflow + audit) and Phase 2.1 (appointments)
-- Safe to run against the existing MamaGuard Supabase database (additive, idempotent).
-- Run in the Supabase SQL editor or via the CLI.

-- ============================================================================
-- Plan 1.2 — alert workflow columns
-- ============================================================================
alter table alerts add column if not exists assigned_to     uuid;
alter table alerts add column if not exists acknowledged_at timestamptz;
alter table alerts add column if not exists acknowledged_by uuid;
alter table alerts add column if not exists resolved_at      timestamptz;
alter table alerts add column if not exists resolved_by      uuid;

-- ============================================================================
-- Plan 1.2 — immutable audit log
-- ============================================================================
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor       text,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  patient_id  uuid references patients (id) on delete set null,
  detail      jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_patient on audit_log (patient_id);
create index if not exists idx_audit_entity  on audit_log (entity_type, entity_id);

alter table audit_log enable row level security;
drop policy if exists "authenticated read audit" on audit_log;
create policy "authenticated read audit" on audit_log
  for select to authenticated using (true);

-- ============================================================================
-- Plan 2.1 — appointments (ANC visits + reminders)
-- ============================================================================
create table if not exists appointments (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references patients (id) on delete cascade,
  scheduled_at     timestamptz not null,
  type             text default 'anc_visit',
  location         text,
  status           text default 'scheduled'
                     check (status in ('scheduled','confirmed','completed','missed','cancelled')),
  reminder_sent_at timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_appointments_patient on appointments (patient_id);
create index if not exists idx_appointments_due
  on appointments (scheduled_at) where status in ('scheduled','confirmed');

alter table appointments enable row level security;
drop policy if exists "authenticated full access" on appointments;
create policy "authenticated full access" on appointments
  for all to authenticated using (true) with check (true);
