-- Migration 0003 — Phase 3: postpartum mode, EPDS screening, vitals/BP tracking.
-- Additive and idempotent; safe to run against the existing database.

-- ============================================================================
-- Postpartum mode (patient-level flag + delivery date)
-- ============================================================================
alter table patients add column if not exists postpartum boolean not null default false;
alter table patients add column if not exists delivery_date date;

-- ============================================================================
-- EPDS screenings (Edinburgh Postnatal Depression Scale, 10 items 0-3)
-- ============================================================================
create table if not exists epds_screenings (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references patients (id) on delete cascade,
  answers         jsonb not null,
  total_score     int not null,
  q10_score       int not null,            -- self-harm item, denormalized for flagging
  risk_flag       boolean not null default false,
  administered_by uuid,
  notes           text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_epds_patient on epds_screenings (patient_id, created_at desc);

alter table epds_screenings enable row level security;
drop policy if exists "authenticated full access" on epds_screenings;
create policy "authenticated full access" on epds_screenings
  for all to authenticated using (true) with check (true);

-- ============================================================================
-- Vitals / blood pressure tracking
-- ============================================================================
create table if not exists vitals (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid not null references patients (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  systolic    int,
  diastolic   int,
  heart_rate  int,
  temperature numeric(4,1),
  weight_kg   numeric(5,2),
  notes       text,
  recorded_by uuid,
  created_at  timestamptz not null default now()
);
create index if not exists idx_vitals_patient on vitals (patient_id, recorded_at desc);

alter table vitals enable row level security;
drop policy if exists "authenticated full access" on vitals;
create policy "authenticated full access" on vitals
  for all to authenticated using (true) with check (true);
