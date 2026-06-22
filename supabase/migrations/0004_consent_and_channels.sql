-- Migration 0004 — Plan 1.3 (consent / data-protection) + Plan 2.2 (channels).
-- Additive and idempotent.

-- 1.3 — explicit consent capture (Morocco Law 09-08 / CNDP).
alter table patients add column if not exists consent_given     boolean not null default false;
alter table patients add column if not exists consent_at         timestamptz;
alter table patients add column if not exists consent_version    text;
-- Optional retention horizon for erasure policy.
alter table patients add column if not exists data_retention_until date;

-- 2.2 — per-patient delivery channel (whatsapp default; sms/ussd/voice fallback).
alter table patients add column if not exists preferred_channel text not null default 'whatsapp';
-- Use a guarded constraint add (no IF NOT EXISTS for constraints).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'patients_preferred_channel_check'
  ) then
    alter table patients add constraint patients_preferred_channel_check
      check (preferred_channel in ('whatsapp','sms','ussd','voice'));
  end if;
end $$;
