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

-- 4. ALERTS (dashboard workflow)
CREATE TABLE alerts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  message_id    uuid REFERENCES messages (id),
  symptom_name  text,
  urgency       text NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status        text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  doctor_notes  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX idx_messages_conv ON messages (conversation_id);
CREATE INDEX idx_alerts_status ON alerts (status) WHERE status = 'active';
CREATE INDEX idx_patients_phone ON patients (phone_number);
CREATE INDEX idx_conversations_patient ON conversations (patient_id);

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

-- Authenticated clinicians: full access to all clinical data.
CREATE POLICY "authenticated full access" ON patients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated full access" ON alerts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- DEMO ONLY (uncomment to allow the unauthenticated dashboard to read data while
-- DISABLE_AUTH=true). Remove before production — this exposes patient data.
-- CREATE POLICY "anon read (demo)" ON patients      FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read (demo)" ON conversations FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read (demo)" ON messages      FOR SELECT TO anon USING (true);
-- CREATE POLICY "anon read (demo)" ON alerts        FOR SELECT TO anon USING (true);
