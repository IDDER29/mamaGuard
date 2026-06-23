-- Migration 0012 — production scale: hot-path indexes. Additive + idempotent.

-- Webhook dedup looks up messages by metadata->>'wamid' on EVERY inbound message;
-- without this it's a full scan as the table grows.
create index if not exists idx_messages_wamid on messages ((metadata->>'wamid'));

-- Conversation history fetch (last N by time) + chat render.
create index if not exists idx_messages_conv_created on messages (conversation_id, created_at desc);

-- Patient list / dashboard ordering by recency.
create index if not exists idx_patients_created on patients (created_at desc);

-- Risk filtering on the triage board / analytics.
create index if not exists idx_patients_risk on patients (risk_level);

-- Alert queue ordering + per-patient lookups.
create index if not exists idx_alerts_patient on alerts (patient_id);
create index if not exists idx_alerts_created on alerts (created_at desc);
