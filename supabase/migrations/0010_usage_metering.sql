-- Migration 0010 — Plan E7.1 hardening: real usage metering for cost-per-mother.
-- Additive + idempotent.

create table if not exists usage_events (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,            -- llm | stt | tts | whatsapp | sms
  units      numeric not null default 1,   -- tokens, seconds, or messages
  cost_usd   numeric not null default 0,
  patient_id uuid references patients (id) on delete set null,
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_kind on usage_events (kind, created_at desc);

alter table usage_events enable row level security;
drop policy if exists "authenticated read usage" on usage_events;
create policy "authenticated read usage" on usage_events
  for select to authenticated using (true);
