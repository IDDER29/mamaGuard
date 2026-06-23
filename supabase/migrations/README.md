# Database migrations

Apply these **in numeric order** to bring a MamaGuard database up to date with
`schema.sql`. Every migration is **additive and idempotent** (`IF NOT EXISTS`
guards, `DROP POLICY ... / CREATE POLICY`, seed guarded by `WHERE NOT EXISTS`),
so re-running is safe.

| # | File | Adds |
|---|------|------|
| 0000 | `0000_baseline_patient_fields.sql` | Patient onboarding columns (full_name, DOB, blood_type, emergency/partner contacts, trimester, …) |
| 0001 | `0001_phase1_2_phase2.sql` | Alert workflow columns, `audit_log`, `appointments` |
| 0002 | `0002_partner_engagement.sql` | `patients.partner_opt_in` |
| 0003 | `0003_phase3_postpartum_epds_vitals.sql` | Postpartum flags, `epds_screenings`, `vitals` |
| 0004 | `0004_consent_and_channels.sql` | Consent columns, `preferred_channel` |
| 0005 | `0005_phase4_referrals_chw.sql` | `assigned_chw`, `facilities`, `referrals` |
| 0006 | `0006_seed_facilities.sql` | Seeds a starter facility directory (only if empty) |
| 0007 | `0007_notifications_sla.sql` | `notifications` + alert SLA columns |
| 0008 | `0008_clinician_roles.sql` | `clinician_profiles` (roles) |
| 0009 | `0009_deliveries_identities_invites.sql` | `message_deliveries`, `patient_identifiers`, `clinician_invites`, `appointments.meeting_url` |
| 0010 | `0010_usage_metering.sql` | `usage_events` (cost metering) |
| 0011 | `0011_role_rls.sql` | `current_clinician_role()` + admin-only RLS on profiles/invites |

> An already-deployed database likely has the 0000 columns; the guards make it a
> no-op there. Run 0000 first anyway — it harmlessly fills any gaps.
> Migration 0011 uses Supabase's `auth.uid()` (provided automatically on Supabase).

## How to run

**Supabase SQL Editor (simplest):** open each file in order and run it.

**Supabase CLI:**
```bash
supabase db push          # if these are tracked as the project's migrations
# or apply one file:
supabase db execute --file supabase/migrations/0000_baseline_patient_fields.sql
```

**psql (direct):**
```bash
for f in supabase/migrations/0*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```

The policies reference the Supabase-provided roles `authenticated` / `anon` /
`service_role` — those exist on Supabase automatically. (On a vanilla Postgres
you'd `CREATE ROLE` them first; not needed on Supabase.)

## Validation

Validated locally on PostgreSQL 16 (Supabase roles created to match):
- The original base schema + `0000`→`0006` applied in order **with no errors**.
- Re-running the whole set is a clean **no-op** (idempotent); the facility seed
  does not duplicate.
- The resulting schema is **column-for-column identical** to a fresh `schema.sql`
  install (121 columns across all tables) — i.e. the migration path and the
  source-of-truth schema agree.
- RLS is enabled with the expected policies on `appointments`, `epds_screenings`,
  `vitals`, `referrals`, `facilities`, and `audit_log`.
