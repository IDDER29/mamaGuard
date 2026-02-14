-- Mama AI – Optimized Supabase Schema
-- Includes Medical Context & Dashboard Support

-- 1. PATIENTS
CREATE TABLE patients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number  text NOT NULL UNIQUE,
  name          text,
  due_date      date,
  gestational_week int DEFAULT 1, -- Added for medical logic
  risk_level    text DEFAULT 'low', -- Current overall status
  language      text DEFAULT 'darija',
  medical_history jsonb, -- { chronic_conditions?: string, previous_c_sections?: number }
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. CONVERSATIONS (The thread wrapper)
CREATE TABLE conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. MESSAGES (Now with Audio support)
CREATE TABLE messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('user', 'assistant')),
  content          text NOT NULL,
  audio_url        text, -- For ElevenLabs/WhatsApp Voice clips
  metadata         jsonb, -- Store symptom detection results here
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 4. ALERTS (Enhanced for Dashboard workflow)
CREATE TABLE alerts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  message_id       uuid REFERENCES messages (id), -- Link to the specific message
  symptom_name     text, 
  urgency          text NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status           text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  doctor_notes     text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexing for performance
CREATE INDEX idx_messages_conv ON messages (conversation_id);
CREATE INDEX idx_alerts_status ON alerts (status) WHERE status = 'active';