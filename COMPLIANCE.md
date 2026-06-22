# COMPLIANCE.md — Data-Protection Posture (Law 09-08 / CNDP)

> **Working document, not legal advice.** This is an engineering-maintained
> living document mapping how MamaGuard ("Mama AI") processes personal data
> under Moroccan **Law No. 09-08** on the protection of individuals with regard
> to the processing of personal data, supervised by the **CNDP** (Commission
> Nationale de contrôle de la protection des Données à caractère Personnel).
> Items marked **👤 legal** require review by a qualified Moroccan
> data-protection lawyer and/or a formal CNDP filing before production launch.
> Keep this file in sync with the code paths it cites.

---

## 1. Purpose & scope

MamaGuard collects and processes **health data about pregnant and postpartum
patients in Morocco** (symptoms, gestational data, blood type, medications,
allergies, chat and voice content, national ID). Under Law 09-08, health data is
**"sensitive personal data"** (données sensibles, Art. 1 & Art. 12), which:

- is **prohibited from processing by default**, and
- may only be processed under a narrow lawful basis — in practice, the data
  subject's **explicit consent** and/or a recognised health-care exemption,
- with **prior authorization** (not merely declaration) from the CNDP, and
- with **CNDP authorization for any cross-border transfer**.

This document tracks: where the data flows, the lawful basis and consent model,
cross-border transfers, the CNDP filing checklist, and retention/erasure. It
covers the WhatsApp + AI conversational pipeline and the clinician dashboard,
both backed by Supabase.

---

## 2. Data-flow map

Every external system that touches patient data. "Cross-border" means the data
leaves Morocco (all listed third-party processors are operated outside Morocco
today and therefore trigger the Art. 43 cross-border transfer regime).

| # | Processor / sink | Data sent | Direction | Cross-border? | Trigger (env var / code path) |
|---|---|---|---|---|---|
| 1 | **Supabase** (Postgres + Realtime) — primary store of record | Full patient PII (name, national ID, DOB, phone, address, emergency/partner contacts), medical history, gestational data, all chat **transcripts/messages**, triage results, alerts, consent records | App → store (read/write) | **MUST CONFIRM** — region is **unverified**; default Supabase projects are commonly US/EU. **Flag: confirm the project region and relocate to a CNDP-allowed jurisdiction.** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; clients in `utils/supabase/{server,client,admin}.ts`; schema `schema.sql` |
| 2 | **OpenAI — Whisper** (speech-to-text) | Raw **patient voice-note audio** (Darija health speech) | App → OpenAI (audio out, transcript back) | **Yes (US)** | `OPENAI_API_KEY`; `lib/transcribe.ts` (`POST https://api.openai.com/v1/audio/transcriptions`); invoked from `app/api/webhook/route.ts` audio branch |
| 3 | **OpenAI — Chat Completions** (reply generation) | Patient **transcript/message text**, name, gestational week, risk level, **doctor/clinical notes**, recent chat history (all injected into the system prompt) | App → OpenAI (prompt out, reply back) | **Yes (US)** | `OPENAI_API_KEY`, `OPENAI_MODEL`; `lib/generateMamaResponse.ts` → `callOpenAI()` (`POST https://api.openai.com/v1/chat/completions`) |
| 4 | **MiniMax** (fallback LLM, used only when no `OPENAI_API_KEY`) | Same prompt payload as #3 (message + patient context + clinical notes + history) | App → MiniMax (prompt out, reply back) | **Yes (non-Morocco; MiniMax is operated from China)** | `MINIMAX_API_KEY`, `MINIMAX_MODEL`; `lib/generateMamaResponse.ts` → `callMiniMax()` (`POST https://api.minimax.io/v1/text/chatcompletion_v2`) |
| 5 | **ElevenLabs** (text-to-speech) | The **AI reply text** in Darija (derived from the patient's health conversation) | App → ElevenLabs (text out, audio back) | **Yes (US)** | `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`; `lib/speak.ts` (`POST https://api.elevenlabs.io/v1/text-to-speech/...`); invoked from `app/api/webhook/route.ts` voice-reply branch |
| 6 | **Meta — WhatsApp Cloud API** (message transport) | Patient **phone number**, inbound/outbound **message text**, **voice-note audio** (download + upload of media), partner phone + partner notification text | Bi-directional transport | **Yes (US / Meta global infra)** | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `VERIFY_TOKEN`; `app/api/webhook/route.ts` (Graph API `graph.facebook.com`), `app/api/whatsapp/send/route.ts`, welcome message in `app/actions/patients.ts` |

**Notes on sensitivity:** items #2–#5 each transmit health-related content of an
identifiable pregnant patient across borders. Item #6 is the transport channel
through which all patient communication enters and leaves the system. Item #1 is
the central repository and the highest-value target.

---

## 3. Lawful basis & consent

**Lawful basis for sensitive (health) data: the patient's explicit, informed,
freely-given opt-in consent** (Law 09-08 Art. 12). Implied or pre-ticked consent
is not sufficient for health data.

**Consent model now in the schema** (`schema.sql`, `patients` table, "Consent /
data protection (Law 09-08 / CNDP, Plan 1.3)" block):

| Column | Type | Meaning |
|---|---|---|
| `consent_given` | `boolean NOT NULL DEFAULT false` | Whether the patient has opted in. **Defaults to false** — consent must be affirmatively recorded. |
| `consent_at` | `timestamptz` | When consent was captured. |
| `consent_version` | `text` | Which version of the consent/privacy notice the patient agreed to (supports re-consent when terms change). |
| `data_retention_until` | `date` | The retention horizon for this patient's data (see §6). |

**How consent is engineered:**

- Consent is captured at **onboarding** via the `registerPatient()` server
  action (`app/actions/patients.ts`), which writes `consent_given`,
  `consent_at`, and `consent_version` alongside the patient record.
- The **channel/send layer refuses to send** to a patient when
  `consent_given` is `false`, so no outbound health messaging happens without a
  recorded opt-in.

**👤 legal / open:** the wording of the consent notice (purpose, recipients
including the cross-border processors in §2, retention period, rights of access
and erasure, withdrawal mechanism) must be drafted/reviewed for Law 09-08
adequacy, in Darija/Arabic and French, and the agreed text frozen as a
`consent_version`.

---

## 4. Cross-border transfer

Under Law 09-08 **Art. 43–45**, transferring personal data — especially
sensitive health data — to a country that does not ensure an adequate level of
protection requires **prior CNDP authorization**. Every processor in §2 except a
Morocco-hosted Supabase region currently involves a cross-border transfer:

| Processor | Outside Morocco | Transfer of health data? | Action required |
|---|---|---|---|
| **Supabase** | **Unconfirmed** (likely yes) | Yes (store of record) | Confirm region; relocate to a CNDP-acceptable region or obtain authorization; **sign a DPA**. |
| **OpenAI** (Whisper + GPT) | Yes (US) | Yes (audio + transcripts + clinical notes) | CNDP cross-border authorization; **sign a DPA** (and enable any data-retention / no-training options). |
| **MiniMax** | Yes (China) | Yes (prompt payload) | CNDP cross-border authorization; **sign a DPA**. Higher scrutiny — evaluate whether to disable this fallback for production. |
| **ElevenLabs** | Yes (US) | Yes (reply text derived from health convo) | CNDP cross-border authorization; **sign a DPA**. |
| **Meta / WhatsApp Cloud API** | Yes (US / global) | Yes (transport of all messages + audio) | CNDP cross-border authorization; rely on Meta's WhatsApp Business / data-processing terms; **sign/accept a DPA**. |

**Recommendation:** execute a **Data Processing Agreement (DPA)** with **each**
of Supabase, OpenAI, MiniMax, ElevenLabs, and Meta, and document the lawful
transfer mechanism for each in the CNDP filing. **👤 legal** owns confirming
which mechanism (authorization, model clauses, consent-based derogation) applies
per processor.

---

## 5. CNDP checklist

- [ ] **Declaration / authorization filed** with the CNDP for processing
      sensitive health data (health data requires *authorization*, not just a
      declaration). **👤 legal**
- [ ] **Data-flow diagram maintained** — keep the §2 table current; update it
      whenever a new processor, endpoint, or data field is added.
- [ ] **Consent records** demonstrably captured and queryable
      (`consent_given` / `consent_at` / `consent_version` in `patients`), with a
      reviewed consent notice text per `consent_version`. **👤 legal** (text)
- [ ] **Retention & erasure policy** defined and enforced, anchored on
      `data_retention_until` (see §6).
- [ ] **Encryption-at-rest verified** for the store of record (confirm Supabase
      Postgres encryption-at-rest and TLS in transit; document the evidence).
- [ ] **Processor DPAs** signed with Supabase, OpenAI, MiniMax, ElevenLabs, Meta
      (see §4). **👤 legal**
- [ ] **Cross-border transfer authorization** obtained / mechanism documented
      per processor (see §4). **👤 legal**
- [ ] **Breach-notification process** documented (who is notified, CNDP and
      data-subject notification timelines, runbook owner). **👤 legal** (timelines)
- [ ] **Data-subject rights process** — access, rectification, objection, and
      erasure requests have an owner and an SLA (see §6).
- [ ] **Secrets rotated & secured** — `.env` is git-ignored; any previously
      committed keys are considered compromised and must be rotated (see
      `CLAUDE.md` security note).
- [ ] **Service-role key protection** — `SUPABASE_SERVICE_ROLE_KEY` is
      server-only and never shipped to the browser; RLS enabled in production
      (no anon access; demo `anon` policies in `schema.sql` stay commented out).

---

## 6. Retention & erasure (policy stub)

**Retention horizon.** Each patient row carries `data_retention_until` (a
`date`, in `schema.sql`). **👤 legal:** set the actual horizon — it must be the
shorter of (a) the period necessary for the maternal-health care purpose, e.g.
through pregnancy + postpartum follow-up plus any mandated medical-record
retention, and (b) what the consent notice promised. A scheduled job should
purge or anonymise records whose `data_retention_until` has passed (**not yet
implemented — open item**).

**Erasure on request.** When a patient withdraws consent or requests deletion,
the data model already supports a clean cascade. Verified in `schema.sql`:

- `conversations.patient_id → patients(id) **ON DELETE CASCADE**`
- `messages.conversation_id → conversations(id) **ON DELETE CASCADE**`
- `alerts.patient_id → patients(id) **ON DELETE CASCADE**`
- `appointments.patient_id → patients(id) **ON DELETE CASCADE**`
- `epds_screenings.patient_id → patients(id) **ON DELETE CASCADE**`
- `vitals.patient_id → patients(id) **ON DELETE CASCADE**`
- `audit_log.patient_id → patients(id) **ON DELETE SET NULL**` (the audit trail
  is intentionally retained but de-linked from the patient, preserving an
  immutable record of clinical/triage actions while removing the PII linkage).

So deleting a `patients` row cascades to all conversations, messages, alerts,
appointments, screenings, and vitals in one operation, while the audit log
survives with the patient reference nulled.

**Caveat — external copies.** Cascade deletes only cover **Supabase**. Data
already transmitted to OpenAI / MiniMax / ElevenLabs / Meta (§2) is **not**
reached by a DB delete. The erasure process must therefore also invoke each
processor's deletion/retention controls (and the DPAs in §4 must guarantee
those controls exist). **👤 legal / open item.**

---

## 7. Open items / 👤 legal

**Already engineered (in code today):**

- Consent columns in `schema.sql` (`consent_given` default `false`,
  `consent_at`, `consent_version`, `data_retention_until`).
- Consent capture at onboarding in `registerPatient()`
  (`app/actions/patients.ts`); send layer refuses to message without
  `consent_given`.
- Cascade-delete FKs enabling one-shot erasure; audit log de-linked on delete.
- Row Level Security enabled with service-role-only server writes; anon access
  denied (demo policies commented out) — `schema.sql`.
- Secrets removed from the repo (`.env` git-ignored) — `CLAUDE.md`.
- Partner notification gated on `partner_opt_in` and deliberately shares **no
  medical detail** (`app/api/webhook/route.ts`).

**Requires a lawyer / CNDP filing (👤 legal):**

- File the CNDP **authorization** for sensitive health-data processing.
- Draft/review the consent notice text (Darija/Arabic + French) and freeze it as
  a `consent_version`.
- Obtain cross-border transfer authorization and **sign DPAs** with Supabase,
  OpenAI, MiniMax, ElevenLabs, and Meta; decide whether MiniMax (China) is
  acceptable in production.
- Set the concrete retention horizon for `data_retention_until` and the legal
  basis for it.
- Define breach-notification timelines and the data-subject rights SLA.

**Engineering follow-ups (not yet built):**

- **Confirm and, if needed, relocate the Supabase project region** to a
  CNDP-acceptable jurisdiction (highest-priority open item in §2).
- Implement a **retention purge job** that acts on `data_retention_until`.
- Implement an **erasure workflow** that both deletes the `patients` row
  (cascade) and calls each external processor's deletion controls.
- Verify and document **encryption-at-rest** for Supabase.
