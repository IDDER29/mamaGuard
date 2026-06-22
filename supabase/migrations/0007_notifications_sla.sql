-- Migration 0007 — Phase E1: clinician notifications + SLA escalation.
-- Additive and idempotent.

-- E1.1 — notifications (broadcast when recipient is null).
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient   uuid,                       -- null = all clinicians (broadcast)
  type        text not null,              -- alert_critical|alert_high|sla_warning|sla_breach|system
  title       text not null,
  body        text,
  entity_type text,                       -- 'alert' | 'patient'
  entity_id   uuid,
  patient_id  uuid references patients (id) on delete cascade,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_recipient on notifications (recipient, read_at);
create index if not exists idx_notifications_created on notifications (created_at desc);

alter table notifications enable row level security;
drop policy if exists "authenticated full access" on notifications;
create policy "authenticated full access" on notifications
  for all to authenticated using (true) with check (true);

-- E1.2 — SLA escalation state on alerts.
alter table alerts add column if not exists sla_warned      boolean not null default false;
alter table alerts add column if not exists escalated_at    timestamptz;
alter table alerts add column if not exists escalation_level int not null default 0;
