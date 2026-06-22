-- Mama AI – Supabase Schema (kept in sync with app/actions/patients.ts & types/index.ts)
-- Includes Medical Context, Dashboard Support, and Row Level Security.
--
-- ACCESS MODEL
--   • Clinician dashboard (browser): uses the anon key + an authenticated session.
--     The policies below grant the `authenticated` role full access.
--   • Server writes (WhatsApp webhook, cron, server actions): use the SERVICE ROLE
--     key via utils/supabase/admin.ts. service_role BYPASSES RLS automatically, so
--     no policy is needed for it. Set SUPABASE_SERVICE_ROLE_KEY in the environment.
--   • Anonymous users get NO access once RLS is enabled. For an open demo without
--     login, either keep DISABLE_AUTH=true AND add explicit anon policies, or sign
--     the clinician in. Do not ship anon write access to production.

-- 1. PATIENTS
CREATE TABLE patients (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number              text NOT NULL UNIQUE,
  name                      text,
  full_name                 text,
  date_of_birth             date,
  national_id               text,
  country_code              text DEFAULT '+212',
  is_whatsapp               boolean DEFAULT true,
  alternative_phone         text,
  location_address          text,
  due_date                  date,
  last_menstrual_period     date,
  gestational_week          int DEFAULT 1,        -- medical logic
  trimester                 int CHECK (trimester IN (1, 2, 3)),
  risk_level                text DEFAULT 'low',   -- low | medium | high | critical
  blood_type                text,
  previous_pregnancies      int DEFAULT 0,
  medical_history           jsonb,                -- { notes?, last_resume?, chronic_conditions?, previous_c_sections? }
  current_medications       text,
  allergies                 text,
  emergency_contact_name    text,
  emergency_contact_relation text,
  emergency_contact_phone   text,
  spouse_partner_name       text,
  spouse_partner_phone      text,
  partner_opt_in            boolean NOT NULL DEFAULT false,
  postpartum                boolean NOT NULL DEFAULT false,
  delivery_date             date,
  -- Consent / data protection (Law 09-08 / CNDP, Plan 1.3)
  consent_given             boolean NOT NULL DEFAULT false,
  consent_at                timestamptz,
  consent_version           text,
  data_retention_until      date,
  -- Delivery channel (Plan 2.2)
  preferred_channel         text NOT NULL DEFAULT 'whatsapp'
                              CHECK (preferred_channel IN ('whatsapp','sms','ussd','voice')),
  assigned_chw              uuid,   -- community health worker (Plan 4.1)
  preferred_checkup_time    time,
  voice_reporting_frequency text,
  language                  text DEFAULT 'darija',
  has_smartphone            boolean DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- 2. CONVERSATIONS (the thread wrapper)
CREATE TABLE conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. MESSAGES (with audio support)
CREATE TABLE messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('user', 'assistant')),
  content          text NOT NULL,
  audio_url        text,    -- ElevenLabs / WhatsApp voice clips
  metadata         jsonb,   -- { wamid?, risk?, source?, voice?, audio_media_id? }
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 4. ALERTS (dashboard workflow — human-in-the-loop triage, Plan 1.2)
CREATE TABLE alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  message_id      uuid REFERENCES messages (id),
  symptom_name    text,
  urgency         text NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status          text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  assigned_to     uuid,            -- clinician (auth.users id) who owns the alert
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at     timestamptz,
  resolved_by     uuid,
  doctor_notes    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 5. AUDIT LOG (immutable trail of triage decisions & clinician actions, Plan 1.2)
CREATE TABLE audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor       text,              -- 'system' | clinician id/email
  action      text NOT NULL,     -- e.g. 'triage.assessed','alert.acknowledged','alert.resolved'
  entity_type text,              -- 'alert' | 'patient' | 'message'
  entity_id   uuid,
  patient_id  uuid REFERENCES patients (id) ON DELETE SET NULL,
  detail      jsonb,             -- urgency, triage_version, signs, notes, etc.
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 6. APPOINTMENTS (ANC visits + WhatsApp reminders, Plan 2.1)
CREATE TABLE appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  scheduled_at     timestamptz NOT NULL,
  type             text DEFAULT 'anc_visit',
  location         text,
  status           text DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','confirmed','completed','missed','cancelled')),
  reminder_sent_at timestamptz,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 9. FACILITIES (referral directory, Plan 4.4)
CREATE TABLE facilities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  type       text,
  region     text,
  city       text,
  phone      text,
  latitude   double precision,
  longitude  double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. REFERRALS (escalation loop from alert -> facility, Plan 4.4)
CREATE TABLE referrals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  alert_id       uuid REFERENCES alerts (id) ON DELETE SET NULL,
  facility_id    uuid REFERENCES facilities (id) ON DELETE SET NULL,
  status         text NOT NULL DEFAULT 'created'
                   CHECK (status IN ('created','en_route','arrived','completed','cancelled')),
  reason         text,
  transport_note text,
  created_by     uuid,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 7. EPDS SCREENINGS (Edinburgh Postnatal Depression Scale, Phase 3)
CREATE TABLE epds_screenings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  answers         jsonb NOT NULL,      -- array of 10 ints 0-3
  total_score     int NOT NULL,
  q10_score       int NOT NULL,        -- self-harm item, denormalized for flagging
  risk_flag       boolean NOT NULL DEFAULT false,
  administered_by uuid,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 8. VITALS (blood pressure + other vitals over time, Phase 3)
CREATE TABLE vitals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  systolic    int,
  diastolic   int,
  heart_rate  int,
  temperature numeric(4,1),
  weight_kg   numeric(5,2),
  notes       text,
  recorded_by uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX idx_messages_conv ON messages (conversation_id);
CREATE INDEX idx_alerts_status ON alerts (status) WHERE status = 'active';
CREATE INDEX idx_patients_phone ON patients (phone_number);
CREATE INDEX idx_conversations_patient ON conversations (patient_id);
CREATE INDEX idx_audit_patient ON audit_log (patient_id);
CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_due ON appointments (scheduled_at) WHERE status IN ('scheduled','confirmed');
CREATE INDEX idx_epds_patient ON epds_screenings (patient_id, created_at DESC);
CREATE INDEX idx_vitals_patient ON vitals (patient_id, recorded_at DESC);
CREATE INDEX idx_facilities_region ON facilities (region);
CREATE INDEX idx_referrals_patient ON referrals (patient_id);
CREATE INDEX idx_referrals_status ON referrals (status);

-- Keep updated_at fresh on patients
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE patients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log     ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE epds_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals     ENABLE ROW LEVEL SECURITY;

-- Authenticated clinicians: full access to clinical data.
CREATE POLICY "authenticated full access" ON patients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON alerts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON epds_screenings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON vitals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON facilities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON referrals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Audit log: clinicians may read; only the service role writes (immutability).
CREATE POLICY "authenticated read audit" ON audit_log
  FOR SELECT TO authenticated USING (true);

-- DEMO ONLY (uncomment to allow the unauthenticated dashboard to read data while
-- DISABLE_AUTH=true). Remove before production — this exposes patient data.
-- CREATE POLICY "anon read (demo)" ON patients      FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read (demo)" ON conversations FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read (demo)" ON messages      FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read (demo)" ON alerts        FOR SELECT TO anon USING (true);
