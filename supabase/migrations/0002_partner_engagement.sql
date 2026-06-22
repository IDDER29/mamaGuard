-- Migration 0002 — Plan 2.4 partner / family engagement loop.
-- Reuses the existing spouse_partner_name / spouse_partner_phone columns and
-- adds an explicit consent flag. Safe to run on the existing database.

alter table patients add column if not exists partner_opt_in boolean not null default false;
