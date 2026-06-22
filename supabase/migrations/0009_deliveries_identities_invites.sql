-- Migration 0009 — remaining roadmap schema (E2.4 deliveries, E6.4 identities,
-- E4.2 invites, E8.1 teleconsult). Additive + idempotent.

-- E2.4 — per-message delivery log (observability + retry).
create table if not exists message_deliveries (
  id          uuid primary key default gen_random_uuid(),
  patient_id  uuid references patients (id) on delete cascade,
  channel     text not null,
  status      text not null default 'sent',   -- sent|failed|skipped
  attempts    int not null default 1,
  error       text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_deliveries_patient on message_deliveries (patient_id, created_at desc);

-- E6.4 — patient identity across channels/numbers (dedupe/merge).
create table if not exists patient_identifiers (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients (id) on delete cascade,
  channel    text not null,                   -- whatsapp|sms|ussd|voice
  value      text not null,                   -- phone/number/id
  created_at timestamptz not null default now(),
  unique (channel, value)
);
create index if not exists idx_identifiers_patient on patient_identifiers (patient_id);

-- E4.2 — clinician invites.
create table if not exists clinician_invites (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role        text not null default 'clinician'
                check (role in ('chw','nurse','clinician','supervisor','admin','integration')),
  token       text not null unique,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

-- E8.1 — teleconsultation meeting link on appointments.
alter table appointments add column if not exists meeting_url text;

alter table message_deliveries  enable row level security;
alter table patient_identifiers enable row level security;
alter table clinician_invites   enable row level security;
do $$ begin
  perform 1;
end $$;
drop policy if exists "authenticated full access" on message_deliveries;
create policy "authenticated full access" on message_deliveries for all to authenticated using (true) with check (true);
drop policy if exists "authenticated full access" on patient_identifiers;
create policy "authenticated full access" on patient_identifiers for all to authenticated using (true) with check (true);
drop policy if exists "authenticated full access" on clinician_invites;
create policy "authenticated full access" on clinician_invites for all to authenticated using (true) with check (true);
