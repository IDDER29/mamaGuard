# MamaGuard — Experience Roadmap (Phased)

*Turns the gaps and recommendations in `PRODUCT_EXPERIENCE_BLUEPRINT.md` (§11–12), `INFORMATION_ARCHITECTURE.md`, and `CONVERSATION_DESIGN.md` into an executable, phased plan. Each plan is **full-stack**: it lists Frontend, Backend, and Data/Schema work plus Acceptance, Dependencies, Effort, Risk. Effort: S (<1d) · M (2–5d) · L (1–2wk) · XL (>2wk).*

## How to use this
- Phases are ordered by **trust/safety value first**, then experience foundation, then breadth.
- "Frontend" = the Next.js dashboard unless it says **(conversation)** = the WhatsApp patient surface.
- A plan is **done** only when FE + BE + Data + Acceptance all pass, with CI green (lint/type/build + `npm run test:triage` + `npm run test:safety`) and `schema.sql` updated alongside any migration.
- Status legend: ⬜ not started · 🟦 partially built (extend) · ✅ done.

---

## Phase E1 — Make the human-in-the-loop actually work (highest priority)
*SLAs and "a clinician will help" are promises. Today nothing pings a clinician who isn't staring at the queue, and an unanswered critical has no fallback. This phase makes the safety promise real. Maps to blueprint §3, §7C/D, §12.*

### Plan E1.1 — Clinician notifications (critical + SLA near-breach) ⬜
- **Objective:** A clinician is actively notified when a critical/high alert fires or an SLA is about to breach, even when not on the queue.
- **Frontend:** in-app toast/badge + a notifications bell with unread count; sound/desktop notification opt-in; deep-link to the alert.
- **Backend:** on alert insert (webhook) and on SLA threshold, emit a notification — channel options: (a) Supabase realtime → in-app, (b) email, (c) **WhatsApp-to-clinician** via the channel layer. A lightweight cron (or DB trigger) scans for near-breach actives.
- **Data:** `notifications` table (recipient, type, entity, read_at) or reuse realtime on `alerts`; `clinician_contacts` (phone/email/prefs).
- **Acceptance:** a new critical produces a notification within seconds on a second device; near-breach (e.g. 80% of SLA) notifies the owner/on-call.
- **Depends:** none. **Effort:** L. **Risk:** Med (delivery reliability).

### Plan E1.2 — SLA auto-escalation / reassignment on breach ⬜
- **Objective:** A breached critical never just sits — it escalates.
- **Frontend:** breached items float to top with a distinct "ESCALATED" state; on-call/supervisor sees them; reassignment control.
- **Backend:** cron/trigger flips unacknowledged critical past SLA to an escalated state and notifies the next tier (supervisor/on-call rota).
- **Data:** `alerts.escalated_at`, `alerts.escalation_level`; optional `on_call_rota`.
- **Acceptance:** an unacknowledged critical past 15m escalates + notifies a second person; audit logs the escalation.
- **Depends:** E1.1, E4.1 (roles). **Effort:** M. **Risk:** Med.

### Plan E1.3 — Wire voice replies + confidence-gated transcription fallback 🟦
- **Objective:** Close the voice loop and stop bad transcriptions from causing bad advice.
- **Frontend (conversation):** send a Darija **voice note reply** (ElevenLabs `lib/speak.ts` exists, not wired into the webhook); on low-confidence audio, send a gentle Darija re-ask.
- **Backend:** wire `generateSpeech` → WhatsApp audio in `app/api/webhook/route.ts`; add a transcription-confidence signal in `lib/transcribe.ts` (e.g. avg `no_speech_prob`/length heuristic); **if confidence low BUT danger keywords present → escalate conservatively** (never silently downgrade).
- **Data:** store `messages.metadata.transcription_confidence`, `voice_reply` flag.
- **Acceptance:** patients receive voice replies when TTS is configured; a garbled note with danger words still raises an alert; clean low-confidence note triggers a clarify, not a wrong answer.
- **Depends:** none. **Effort:** M. **Risk:** Med (clinical safety).

### Plan E1.4 — Reply-from-dashboard polish + canned templates 🟦
- **Objective:** Make clinician→patient replies fast and safe.
- **Frontend:** the patient-detail composer (exists) gains **template/quick replies** (Darija/Fr), send-status, and an audit note that a human replied.
- **Backend:** `app/api/whatsapp/send` already exists; add templated message store + log the human reply into `messages` with `metadata.sent_by`.
- **Data:** `message_templates` (locale, category, body); `messages.metadata.sent_by`.
- **Acceptance:** a nurse sends a vetted Darija template in 2 clicks; it appears in the patient timeline attributed to her.
- **Depends:** E4.1. **Effort:** M. **Risk:** Low.

---

## Phase E2 — Conversation as a first-class surface (patient frontend)
*The conversation is half the product and the least designed. Maps to `CONVERSATION_DESIGN.md`, blueprint §4, §7A/B.*

### Plan E2.1 — Interactive quick replies / numbered menus 🟦
- **Objective:** Low-literacy navigation without free-typing.
- **Frontend (conversation):** WhatsApp interactive buttons / numbered menus for onboarding, "how are you feeling?", confirm/reschedule, consent. SMS fallback uses numbered text.
- **Backend:** webhook parses button payloads + numbered replies; a small menu/intent router precedes the LLM.
- **Data:** `conversations.state`/`expected_reply` to interpret menu answers.
- **Acceptance:** a new mother can complete onboarding + report a feeling using only taps/numbers.
- **Depends:** none. **Effort:** M. **Risk:** Low.

### Plan E2.2 — Language switch end-to-end 🟦
- **Objective:** A mother can choose her language and get it everywhere.
- **Frontend (conversation):** language-choice menu at onboarding + a `LANG` keyword.
- **Backend:** persist `patients.language`; LLM routing exists (`generateMamaResponse`); route STT (`transcribe` lang) + TTS voice by language.
- **Data:** uses existing `patients.language`.
- **Acceptance:** setting French yields French replies, French STT, French TTS.
- **Depends:** E1.3. **Effort:** S–M. **Risk:** Low.

### Plan E2.3 — Translate the content library (FR / Amazigh / MSA) ⬜
- **Objective:** Multilingual is end-to-end, not just reply-routing.
- **Frontend:** `/dashboard/content` shows content per locale.
- **Backend:** `buildGroundingBlock` selects content by patient language.
- **Data:** restructure `lib/content.ts` entries to be locale-keyed (or a `content` table with `locale`); clinician-reviewed translations.
- **Acceptance:** a French/Amazigh patient's grounding + weekly/postpartum guidance is in her language.
- **Depends:** E2.2. **Effort:** L. **Risk:** Low (needs translation review).

### Plan E2.4 — Finish channels (SMS live, USSD/voice), keywords, retry 🟦
- **Objective:** Reach feature phones reliably.
- **Frontend (conversation):** graceful degradation (no audio on SMS); STOP/HELP keywords.
- **Backend:** complete `lib/channels` SMS provider (Twilio) end-to-end; USSD/voice integration or documented partner; send-retry + failure logging.
- **Data:** `message_deliveries` (channel, status, attempts) for observability.
- **Acceptance:** a non-smartphone patient gets reminders via SMS and can reply; failed sends retry and are visible.
- **Depends:** none. **Effort:** L. **Risk:** Med (3rd-party + cost).

---

## Phase E3 — Dashboard UX foundation (design system + responsiveness + a11y)
*Make the dashboard fast, consistent, mobile, and accessible. Maps to blueprint §8, §9, §12.*

### Plan E3.1 — Design-system pass ⬜
- **Objective:** One consistent, robust component vocabulary.
- **Frontend:** design tokens (color/spacing/typography in `globals.css @theme`); standardized `<UrgencyBadge>`, `<SLABadge>`, `<PatientHeader>`, `<ActionBar>`, and a `<DataCard>` with built-in **loading / empty / error** slots; migrate existing cards (appointments, vitals, EPDS, referrals, partner, postpartum, symptom-trends) onto it. Toast usage standardized.
- **Backend:** none (read patterns already via server actions).
- **Acceptance:** no dashboard surface can render blank; all cards share one loading/empty/error pattern.
- **Depends:** none. **Effort:** L. **Risk:** Low.

### Plan E3.2 — Mobile-first navigation + responsive field flows ⬜
- **Objective:** CHWs work one-handed on a phone.
- **Frontend:** **bottom tab bar** (Queue, Worklist, Patients, Search) on mobile; sidebar collapses; vitals/EPDS entry and worklist optimized for touch (≥44px); sticky action bars; pull-to-refresh.
- **Backend:** none.
- **Acceptance:** full triage→act and vitals entry usable on a low-end Android.
- **Depends:** E3.1. **Effort:** L. **Risk:** Low.

### Plan E3.3 — Accessibility pass (WCAG 2.1 AA) ⬜
- **Objective:** Usable by all clinicians; safe color semantics.
- **Frontend:** modal focus-trap + Esc (fix EPDS/edit modals); urgency by **icon+text not color alone**; keyboard shortcuts (⌘K, j/k, a, r, ?); landmarks/aria; visible focus; contrast audit.
- **Backend:** none.
- **Acceptance:** keyboard-only triage works end-to-end; axe/Lighthouse a11y ≥95.
- **Depends:** E3.1. **Effort:** M. **Risk:** Low.

### Plan E3.4 — Dashboard i18n + RTL (FR / AR) ⬜
- **Objective:** Clinicians who read French/Arabic aren't forced into English.
- **Frontend:** i18n framework (e.g. `next-intl`); extract strings; **RTL layout** for Arabic; language switcher.
- **Backend:** persist clinician UI-language pref.
- **Data:** `clinician_profiles.ui_language` (see E4.1).
- **Acceptance:** dashboard fully renders in FR and AR (RTL) with no clipped layouts.
- **Depends:** E4.1, E3.1. **Effort:** L. **Risk:** Med (RTL regressions).

### Plan E3.5 — Live SLA countdown + owner/assignment visibility 🟦
- **Objective:** The clock ticks and you can see who owns what.
- **Frontend:** SLA badge counts down live (interval/`requestAnimationFrame` with reduced-motion respect); show alert owner avatar + assigned CHW on rows.
- **Backend:** `listActiveAlerts` returns `acknowledged_by`/`assigned_to` + acknowledged_at; resolve clinician identity.
- **Data:** already on `alerts`; join clinician profile name/avatar.
- **Acceptance:** SLA visibly ticks; each active alert shows owner; no double-handling.
- **Depends:** E4.1. **Effort:** M. **Risk:** Low.

---

## Phase E4 — Roles, collaboration & admin
*Today only `assigned_chw` exists; there is no real role model. Maps to blueprint §5, §6 (collaboration/account), IA roles matrix.*

### Plan E4.1 — Role model + RLS enforcement ⬜
- **Objective:** Real roles: CHW, clinician/nurse, supervisor, admin, integration.
- **Frontend:** role-aware nav/actions (hide what a role can't do).
- **Backend:** `clinician_profiles` (user_id, role, full_name, region, ui_language); RLS policies per role; server-action guards.
- **Data:** `clinician_profiles` table + RLS; seed an admin.
- **Acceptance:** a CHW can't reach admin; supervisor sees team; access is enforced server-side, not just hidden.
- **Depends:** none (foundational for E1.2, E3.4/5, E4.3/4). **Effort:** L. **Risk:** Med (RLS correctness).

### Plan E4.2 — Auth screens + session + account management ⬜
- **Frontend:** polished login/logout/reset; profile/account page; clinician invite/accept.
- **Backend:** Supabase auth flows; invite tokens; profile CRUD.
- **Data:** `clinician_profiles`.
- **Acceptance:** a new clinician is invited, sets a password, lands role-scoped.
- **Depends:** E4.1. **Effort:** M. **Risk:** Low.

### Plan E4.3 — Admin console (users/roles, facilities, audit viewer) ⬜
- **Frontend:** `/dashboard/admin`: manage clinicians/roles; **facilities CRUD** (today seeded only); **audit-log viewer** with filters.
- **Backend:** admin-guarded CRUD actions; audit query API.
- **Data:** `facilities` (exists), `audit_log` (exists), `clinician_profiles`.
- **Acceptance:** admin adds a facility + a clinician and reviews the audit trail in-app.
- **Depends:** E4.1. **Effort:** L. **Risk:** Low.

### Plan E4.4 — Supervisor views + reassignment + caseload ⬜
- **Frontend:** supervisor dashboard: team SLA performance, caseload per CHW, reassign alerts/patients.
- **Backend:** reassignment actions (`assigned_chw`, alert `assigned_to`); team aggregates.
- **Data:** uses existing columns.
- **Acceptance:** supervisor rebalances load and sees per-CHW SLA adherence.
- **Depends:** E4.1, E7.3. **Effort:** L. **Risk:** Low.

---

## Phase E5 — Notifications center, settings & state polish
*Maps to blueprint §6 (settings/notifications), §8 (states).* 

### Plan E5.1 — Notifications center (in-app) + preferences ⬜
- **Frontend:** bell + center listing critical/SLA/system events; per-type prefs.
- **Backend:** notifications store + realtime; preference respect.
- **Data:** `notifications`, `clinician_profiles.notification_prefs`.
- **Acceptance:** clinician reviews/dismisses notifications; prefs change delivery.
- **Depends:** E1.1, E4.1. **Effort:** M. **Risk:** Low.

### Plan E5.2 — Settings (profile, language, channel, prefs) ⬜
- **Frontend:** `/dashboard/settings` (clinician) — profile, UI language, notification prefs.
- **Backend:** settings CRUD.
- **Data:** `clinician_profiles`.
- **Acceptance:** settings persist and take effect.
- **Depends:** E4.1, E3.4. **Effort:** S–M. **Risk:** Low.

### Plan E5.3 — Reminder tuning / opt-out / anti-spam ⬜
- **Frontend (conversation):** opt-out + frequency controls; (dashboard) per-patient reminder toggles.
- **Backend:** quiet hours, dedupe, frequency caps in crons; honor opt-out.
- **Data:** `patients.reminder_prefs`, `message_deliveries` (dedupe).
- **Acceptance:** no patient gets spammed; opt-out honored immediately.
- **Depends:** E2.4. **Effort:** M. **Risk:** Low.

### Plan E5.4 — Universal empty/error/offline states ⬜
- **Frontend:** actionable empty states on every list; per-card error+retry; global error boundary; offline banner.
- **Backend:** consistent error contracts from server actions.
- **Acceptance:** every screen handles loading/empty/error/offline gracefully.
- **Depends:** E3.1. **Effort:** M. **Risk:** Low.

---

## Phase E6 — Compliance, consent & data lifecycle
*Maps to `COMPLIANCE.md`, blueprint §3, §12.*

### Plan E6.1 — Consent lifecycle (capture-in-chat + withdrawal) 🟦
- **Frontend (conversation):** explicit consent step in onboarding (menu); `STOP`/withdraw.
- **Backend:** record consent events; channel layer already blocks sends without consent.
- **Data:** `consent_events` (granted/withdrawn, version, ts); `patients.consent_*` (exist).
- **Acceptance:** consent + withdrawal are captured, versioned, and enforced.
- **Depends:** E2.1. **Effort:** M. **Risk:** Med (legal).

### Plan E6.2 — Right-to-erasure / retention purge ⬜
- **Frontend:** admin "erase patient" with typed confirm; patient `DELETE` keyword path.
- **Backend:** cascade erase (FKs already `ON DELETE CASCADE`); retention purge cron using `data_retention_until`.
- **Data:** uses existing columns; `erasure_log`.
- **Acceptance:** an erasure request removes PII across tables and is logged.
- **Depends:** E4.3. **Effort:** M. **Risk:** Med (legal/irreversible).

### Plan E6.3 — Data-residency remediation ⬜ (eng + 👤 legal)
- **Backend/infra:** confirm/relocate Supabase region; DPAs with OpenAI/MiniMax/ElevenLabs/Meta; document cross-border basis (ties to Plan 5.4 in-country model).
- **Acceptance:** documented lawful basis + region posture per `COMPLIANCE.md`.
- **Depends:** none. **Effort:** L. **Risk:** High (legal).

### Plan E6.4 — Patient identity / duplicate handling ⬜
- **Backend:** merge logic for the same mother across WhatsApp/SMS numbers; dedupe on enrollment.
- **Data:** `patient_identifiers` (channel, value) → one patient.
- **Acceptance:** a mother messaging from a 2nd number maps to one record.
- **Depends:** E2.4. **Effort:** M. **Risk:** Med.

---

## Phase E7 — Program / B2G reporting depth
*Underpins funding. Maps to blueprint §5 (P4), §7E, §11.*

### Plan E7.1 — Program KPI + cost-per-mother dashboard ⬜
- **Frontend:** manager view: reach, ANC adherence, alert volumes, SLA performance, **cost-per-mother** (from usage).
- **Backend:** aggregate queries; usage metering (messages, STT/TTS, LLM calls).
- **Data:** `usage_events` or derive from `messages`/logs.
- **Acceptance:** a manager sees live program KPIs + an illustrative cost model.
- **Depends:** E7.3. **Effort:** L. **Risk:** Low.

### Plan E7.2 — Scheduled exports + WHO ANC indicators ⬜
- **Frontend:** report builder + schedule.
- **Backend:** scheduled CSV/FHIR export jobs; WHO ANC DAK indicator mapping.
- **Acceptance:** a weekly report is generated and downloadable/emailed.
- **Depends:** E4.1. **Effort:** M. **Risk:** Low.

### Plan E7.3 — Outcome tracking ⬜
- **Backend:** capture referral outcomes, SLA adherence over time, missed-visit recovery.
- **Data:** extend `referrals`/`appointments` with outcome fields.
- **Acceptance:** outcomes feed analytics + supervisor + KPI views.
- **Depends:** none. **Effort:** M. **Risk:** Low.

---

## Phase E8 — Advanced / strategic (future bets)
*Higher effort, after the experience foundation is solid. Maps to blueprint §11 (advanced).* 

- **E8.1 Teleconsultation** — build live video/voice consult **or remove the "video consultations" promise from onboarding** (truth-in-marketing). FE: scheduling + call UI; BE: provider integration. XL · Med.
- **E8.2 Predictive risk stratification** — FE: risk trend surfacing; BE: model over vitals/symptom history (never replaces the deterministic safety engine). L–XL · Med.
- **E8.3 Connected BP cuff / wearables** — FE: device pairing + readings; BE: device ingestion. XL · Med.
- **E8.4 Offline-first CHW PWA** — FE: offline cache + sync queue; BE: conflict resolution. XL · Med.
- **E8.5 Fine-tuned Darija model deployment** — per `docs/MAMALLAMA.md`; BE: third provider behind `generateMamaResponse`. XL · Med.
- **E8.6 Two-way FHIR / national EHR** — extend `lib/fhir` to write-back + SMART-on-FHIR. XL · Med.

---

## Sequencing summary
- **Now (trust-critical):** E1.1, E1.2, E1.3 — the human-in-the-loop must work; then E1.4.
- **Foundation (parallelizable):** E4.1 (roles, unblocks much) ∥ E3.1 (design system) ∥ E2.1 (quick replies).
- **Then:** E3.2/3.3/3.5 (mobile, a11y, live SLA), E2.2–E2.4 (language + channels), E5.x (notifications/settings/states).
- **Continuous:** E6.x (compliance/consent) — start E6.3 (legal) early; E7.x (reporting) as data accrues.
- **Later:** E8.x strategic bets.

## Cross-cutting guardrails (every plan)
Keep CI green (lint + type + build + `test:triage` + `test:safety`); update `schema.sql` with every migration; service-role admin client for trusted server writes; the LLM may never downgrade a rule-based urgency; log decisions to `audit_log`; capture consent before processing/sharing; respect `prefers-reduced-motion` and WCAG AA.
