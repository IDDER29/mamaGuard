-- Migration 0005 — Phase 4: CHW assignment (4.1), referrals & facilities (4.4).
-- Additive and idempotent.

-- 4.1 — assign a community health worker / nurse to a patient.
alter table patients add column if not exists assigned_chw uuid;

-- 4.4 — facility directory.
create table if not exists facilities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text,                 -- 'hospital' | 'health_center' | 'clinic' | 'maternity'
  region     text,
  city       text,
  phone      text,
  latitude   double precision,
  longitude  double precision,
  created_at timestamptz not null default now()
);
create index if not exists idx_facilities_region on facilities (region);

-- 4.4 — referrals (close the escalation loop from an alert to a facility).
create table if not exists referrals (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references patients (id) on delete cascade,
  alert_id      uuid references alerts (id) on delete set null,
  facility_id   uuid references facilities (id) on delete set null,
  status        text not null default 'created'
                  check (status in ('created','en_route','arrived','completed','cancelled')),
  reason        text,
  transport_note text,
  created_by    uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_referrals_patient on referrals (patient_id);
create index if not exists idx_referrals_status on referrals (status);

alter table facilities enable row level security;
alter table referrals  enable row level security;
drop policy if exists "authenticated full access" on facilities;
create policy "authenticated full access" on facilities
  for all to authenticated using (true) with check (true);
drop policy if exists "authenticated full access" on referrals;
create policy "authenticated full access" on referrals
  for all to authenticated using (true) with check (true);
