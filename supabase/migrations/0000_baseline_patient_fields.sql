-- Migration 0000 — baseline patient onboarding fields.
-- These rich onboarding columns are written by app/actions/patients.ts
-- (registerPatient) and read by normalizePatient. They predate migrations
-- 0001+. On an existing/deployed database they already exist, so every statement
-- is guarded with IF NOT EXISTS and this migration is a safe no-op there.
-- Run it FIRST when bootstrapping from the minimal base schema, so the migration
-- chain reproduces the full schema.sql.

alter table patients add column if not exists full_name                 text;
alter table patients add column if not exists date_of_birth             date;
alter table patients add column if not exists national_id               text;
alter table patients add column if not exists country_code              text default '+212';
alter table patients add column if not exists is_whatsapp               boolean default true;
alter table patients add column if not exists alternative_phone         text;
alter table patients add column if not exists location_address          text;
alter table patients add column if not exists last_menstrual_period     date;
alter table patients add column if not exists trimester                 int;
alter table patients add column if not exists blood_type                text;
alter table patients add column if not exists previous_pregnancies      int default 0;
alter table patients add column if not exists current_medications       text;
alter table patients add column if not exists allergies                 text;
alter table patients add column if not exists emergency_contact_name    text;
alter table patients add column if not exists emergency_contact_relation text;
alter table patients add column if not exists emergency_contact_phone   text;
alter table patients add column if not exists spouse_partner_name       text;
alter table patients add column if not exists spouse_partner_phone      text;
alter table patients add column if not exists preferred_checkup_time    time;
alter table patients add column if not exists voice_reporting_frequency text;
alter table patients add column if not exists has_smartphone            boolean default true;

-- trimester domain guard (only added if the constraint isn't present yet).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'patients_trimester_check') then
    alter table patients add constraint patients_trimester_check check (trimester in (1,2,3));
  end if;
end $$;
