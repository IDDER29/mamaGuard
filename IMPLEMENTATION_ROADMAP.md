# MamaGuard — Implementation Roadmap (Phased)

*Derived from `COMPETITIVE_ANALYSIS.md` (June 2026). Each phase groups multiple plans. Every plan lists: **Objective · Tasks · Touches · Depends on · Effort · Risk · Acceptance · Why** (evidence). Effort: S (<1d) · M (2–5d) · L (1–2wk) · XL (>2wk). Sequencing: do Phase 1 before scaling; Phases 2–3 are user-facing value; Phase 4 unlocks B2G/scale; Phase 5 is evidence/sustainability and can run in parallel from the start.*

---

## Phase 1 — Safety & Compliance Foundation
*Non-negotiable. The product gives clinical triage advice in a regulated, low-resource setting; these plans de-risk it before any growth push.*

### Plan 1.1 — Validated triage engine (replace the keyword matcher)
- **Objective:** Replace naive keyword/substring risk detection with WHO-grounded, deterministic, conservative triage.
- **Tasks:**
  1. Encode the **WHO Antenatal Care Digital Adaptation Kit (DAK)** danger-sign decision logic as versioned, testable rules (red-flag → critical, etc.).
  2. Add **deterministic red-flag escalation** + **conservative over-triage** (uncertainty escalates, never downgrades).
  3. Make the LLM persona **forbidden from lowering urgency** (guard against sycophancy/anchoring); LLM explains, rules decide.
  4. Negation/severity/Darija-spelling handling; unit tests with vignettes; a triage version field on every assessment.
- **Touches:** `lib/symptoms.ts` (rewrite), `app/api/webhook/route.ts`, new `lib/triage/` (rules + tests), `messages.metadata`.
- **Depends on:** none (start here).
- **Effort:** XL · **Risk:** High (clinical correctness).
- **Acceptance:** Every WHO ANC danger sign maps to a rule with a test; emergencies always escalate; no path lets the LLM reduce a rule-set urgency; assessments are versioned + logged.
- **Why:** *Nature Medicine 2026* — LLM triage under-triaged **52%** of emergencies; Semigran/Schmieding — symptom checkers ~57% triage accuracy, safety depends on conservative bias; Ada/Jacaranda use validated engines.

### Plan 1.2 — Human-in-the-loop helpdesk workflow + audit trail
- **Objective:** Turn the dashboard into a real triage *workflow* with clinician ownership and full auditability.
- **Tasks:** Alert assignment/acknowledge/resolve states + SLA timers (target ≤1h on high/critical); "needs human review" queue for uncertain triage; immutable **audit log** of every triage decision, who acted, and outcome; disclaimers/scope-limits surfaced to patients.
- **Touches:** `alerts` table (status workflow already partial), `app/dashboard` (triage board), `app/dashboard/patients/[id]`, new `audit_log` table.
- **Depends on:** 1.1.
- **Effort:** L · **Risk:** Med.
- **Acceptance:** Critical alerts route to a human queue with SLA; all triage actions are auditable; patient sees a clear "this is not a diagnosis, call X in emergency" notice.
- **Why:** MomConnect/Jacaranda nurse helpdesk (≤1h reply, ~85% referred) is the clinical backbone; WHO requires decision support to *complement*, not replace, clinicians.

### Plan 1.3 — Data residency & Morocco Law 09-08 / CNDP compliance
- **Objective:** Make patient-data handling lawful in Morocco.
- **Tasks:** Data-flow map (where audio/transcripts/PII go: Supabase region, OpenAI/MiniMax, ElevenLabs, Meta); confirm/relocate **Supabase region**; obtain/scope **CNDP authorization** for sensitive health data + any cross-border transfer; explicit **consent capture** at onboarding; DPAs with processors; retention/erasure policy; encryption-at-rest verification.
- **Touches:** infra config, `app/actions/patients.ts` (consent), `schema.sql` (consent/retention fields), `utils/supabase/*`, legal.
- **Depends on:** none (start in parallel; 👤 legal needed).
- **Effort:** L (eng) + 👤 legal · **Risk:** High (legal exposure).
- **Acceptance:** Documented lawful basis + CNDP status; consent recorded per patient; no un-authorized cross-border health-data transfer; data-flow diagram maintained.
- **Why:** Law 09-08 — health data is "sensitive," cross-border transfer needs CNDP authorization; current stack likely processes data outside Morocco.

### Plan 1.4 — Darija speech/NLP reliability
- **Objective:** Stop mis-transcription from causing mis-triage.
- **Tasks:** Evaluate a **fine-tuned Darija Whisper** vs. current forced-`ar`; add a transcription-confidence signal; on low confidence or detected danger terms, **escalate conservatively** and/or ask a clarifying question; log transcript + audio reference for review.
- **Touches:** `lib/transcribe.ts`, `app/api/webhook/route.ts`, triage hooks from 1.1.
- **Depends on:** 1.1.
- **Effort:** M · **Risk:** Med.
- **Acceptance:** Measured WER improvement on a Darija test set; low-confidence audio never silently downgrades risk.
- **Why:** Darija has no standard orthography → high word-error; Whisper underperforms on low-resource dialects/noisy audio.

---

## Phase 2 — Engagement & Reach (quick wins)
*Highest expectation-to-effort ratio; broadens usefulness and rural coverage.*

### Plan 2.1 — ANC appointment scheduling + reminders
- **Objective:** Schedule and remind patients of antenatal visits over WhatsApp.
- **Tasks:** `appointments` table; clinician scheduling UI on patient detail; reminder generation (T-48h/T-2h) reusing the cron/WhatsApp send; confirm/reschedule replies; missed-visit flag feeding the triage board.
- **Touches:** new `appointments` table, `app/api/cron/`, `app/dashboard/patients/[id]`, `app/api/whatsapp/send`.
- **Depends on:** none.
- **Effort:** M · **Risk:** Low.
- **Acceptance:** A scheduled visit triggers WhatsApp reminders; patient can confirm/reschedule; missed visits surface to clinicians.
- **Why:** Universal across peers; Wired Mothers reminders raised 4+ ANC visits (OR 2.39).

### Plan 2.2 — SMS / USSD fallback channel
- **Objective:** Reach the ~20% of patients without smartphones/WhatsApp.
- **Tasks:** Channel abstraction layer (so webhook/send logic is channel-agnostic); integrate an SMS/USSD gateway (e.g., Twilio / Africa's Talking / local aggregator); per-patient channel preference (already have `has_smartphone`); graceful feature degradation (no audio on SMS).
- **Touches:** new `lib/channels/`, `app/api/webhook/route.ts`, `app/api/whatsapp/send`, `patients` channel field.
- **Depends on:** none (but cleaner after 1.1).
- **Effort:** L · **Risk:** Med (third-party + cost).
- **Acceptance:** A non-smartphone patient receives messages/reminders via SMS and can reply; channel chosen per patient.
- **Why:** Babyl/PROMPTS/Wired Mothers achieved rural scale precisely via SMS/USSD/voice.

### Plan 2.3 — Educational content library + week-by-week guidance
- **Objective:** On-demand, stage-relevant, expert-reviewed content in Darija.
- **Tasks:** Localize **WHO "Be He@lthy Be Mobile"** maternal message library; `content` table keyed by gestational week/topic; push weekly guidance via the check-in cron; let the agent answer FAQs from this library (retrieval) to reduce hallucination.
- **Touches:** new `content` table + admin UI, `app/api/cron/check-in`, `lib/generateMamaResponse.ts` (retrieval grounding).
- **Depends on:** none.
- **Effort:** L · **Risk:** Low.
- **Acceptance:** Patients get week-appropriate guidance; common questions answer from vetted content, not free-form LLM.
- **Why:** Content library is table stakes (Flo/Ovia/What to Expect); grounding reduces LLM hallucination.

### Plan 2.4 — Partner / family engagement loop
- **Objective:** Keep a partner/family member informed (with consent).
- **Tasks:** Capture partner contact (already partly in onboarding); opt-in consent; educational/support nudges to the partner; emergency-alert notification to family contact.
- **Touches:** `app/actions/patients.ts`, cron, `app/api/whatsapp/send`, consent fields.
- **Depends on:** 1.3 (consent).
- **Effort:** M · **Risk:** Low.
- **Acceptance:** With consent, a partner receives updates and emergency alerts.
- **Why:** Standard (Flo Partners, Ovia); MamaGuard already *markets* family engagement but hasn't built it.

---

## Phase 3 — Continuity of Care
*Extend beyond pregnancy and beyond text — postpartum, mental health, and vitals.*

### Plan 3.1 — Postpartum + newborn module
- **Objective:** Continue care after delivery (MomConnect covers to 2 years).
- **Tasks:** Lifecycle state (pregnant → postpartum → infant) on patient; postpartum message tracks (recovery, breastfeeding, newborn danger signs, immunization reminders); postpartum-specific triage rules.
- **Touches:** `patients` lifecycle field, content tracks, triage rules (1.1), cron.
- **Depends on:** 1.1, 2.3.
- **Effort:** L · **Risk:** Low.
- **Acceptance:** A delivered patient transitions to postpartum content + triage; newborn reminders fire.
- **Why:** Pregnancy-only is a visible gap vs. MomConnect/Jacaranda/Maven/Ovia.

### Plan 3.2 — Maternal mental-health screening
- **Objective:** Detect perinatal depression/anxiety and escalate.
- **Tasks:** Periodic **EPDS** (Edinburgh Postnatal Depression Scale) over WhatsApp; scoring + threshold escalation to clinician/helpdesk; crisis-resource safety-netting with **reliable** trigger (not LLM-dependent).
- **Touches:** screening flow, triage/escalation (1.1/1.2), content.
- **Depends on:** 1.1, 1.2.
- **Effort:** M · **Risk:** Med (crisis handling).
- **Acceptance:** EPDS administered + scored; high scores escalate deterministically; crisis pathway documented.
- **Why:** Maven/Ovia core; LLM crisis-flagging is empirically unreliable, so use a validated instrument.

### Plan 3.3 — Home BP cuff / vitals integration (preeclampsia)
- **Objective:** Capture home blood pressure for hypertensive-disorder monitoring.
- **Tasks:** Manual BP entry over WhatsApp first (cheapest); optional connected cuff later; BP thresholds feed triage (1.1); trend view on patient detail. **Frame value as access/adherence**, not earlier detection.
- **Touches:** `vitals`/`observations` table, triage rules, patient detail UI.
- **Depends on:** 1.1, 3.4.
- **Effort:** L (manual) / XL (devices) · **Risk:** Med.
- **Acceptance:** Patients report BP; out-of-range readings escalate; clinicians see trends.
- **Why:** Babyscripts' core for preeclampsia; **BUMP RCT caveat** — position as access/adherence, not detection.

### Plan 3.4 — Longitudinal symptom logging & trends
- **Objective:** Turn one-off detection into a visualized health timeline.
- **Tasks:** Structured symptom/observation store; trend charts on patient detail; week-over-week deltas surfaced to clinicians.
- **Touches:** `observations` table, `app/dashboard/patients/[id]`, charts (recharts already a dep).
- **Depends on:** 1.1.
- **Effort:** M · **Risk:** Low.
- **Acceptance:** Symptoms/vitals persist and render as trends over time.
- **Why:** Flo/Ovia set the expectation of longitudinal trends, not single detections.

---

## Phase 4 — Health-System Integration & Scale
*Unlocks the B2G / Ministry-of-Health channel and large-scale deployment.*

### Plan 4.1 — Community-health-worker (CHW) / nurse workflows
- **Objective:** Support frontline workers, not just patients (Khushi Baby / NurseConnect).
- **Tasks:** CHW role + auth; CHW-mediated patient enrollment; worker task lists / "due lists"; supervisor view; offline-tolerant flows where feasible.
- **Touches:** auth/roles (Supabase RLS), new CHW views, onboarding.
- **Depends on:** 1.2.
- **Effort:** XL · **Risk:** Med.
- **Acceptance:** A CHW can enroll/track assigned mothers and see due tasks; supervisors monitor.
- **Why:** Khushi Baby (RCT-validated) + NurseConnect prove CHW workflows; fits Morocco's rural community-health model.

### Plan 4.2 — Analytics & facility/government reporting
- **Objective:** Program dashboards + exportable reports.
- **Tasks:** Aggregate metrics (reach, ANC adherence, alerts, outcomes); facility/region breakdowns; CSV/scheduled exports; align indicators to WHO ANC DAK programme indicators.
- **Touches:** new analytics queries/views, dashboard analytics page (route already referenced in nav).
- **Depends on:** data from Phases 1–3.
- **Effort:** L · **Risk:** Low.
- **Acceptance:** Live program metrics + exportable reports; WHO-aligned indicators.
- **Why:** Jacaranda/Khushi/MomConnect feed gov reporting — and it underpins B2G funding.

### Plan 4.3 — FHIR interoperability layer
- **Objective:** Speak HL7 FHIR for EHR/national-system integration.
- **Tasks:** Map internal models → FHIR resources (Patient, Observation, Encounter, CarePlan, Communication); read/write FHIR API; SMART-on-FHIR auth where needed.
- **Touches:** new `lib/fhir/` mapping, API routes.
- **Depends on:** stable schema (Phases 1–3).
- **Effort:** XL · **Risk:** Med.
- **Acceptance:** Core records export/import as valid FHIR resources.
- **Why:** WHO's chosen standard (WHO–HL7 2023) and a stated Morocco national pillar.

### Plan 4.4 — Referral & transport coordination
- **Objective:** Close the escalation loop to a facility.
- **Tasks:** Facility directory (geo); referral creation from an alert; status tracking; optional transport/dispatch note.
- **Touches:** `referrals` + `facilities` tables, triage board.
- **Depends on:** 1.2.
- **Effort:** L · **Risk:** Med.
- **Acceptance:** A critical alert can become a tracked referral to the nearest facility.
- **Why:** Jacaranda refers ~85% of flagged cases; mDoc NaviHealth directory.

### Plan 4.5 — Multilingual expansion
- **Objective:** Beyond Darija — Tamazight/Amazigh, French, MSA (we currently *claim* "10+ languages").
- **Tasks:** Locale layer for content/prompts; per-patient language (field exists); LLM/STT/TTS language routing; translated content library.
- **Touches:** `generateMamaResponse.ts`, `transcribe.ts`, `speak.ts`, content, `language` field.
- **Depends on:** 2.3.
- **Effort:** L · **Risk:** Low-Med.
- **Acceptance:** A patient set to French/Amazigh gets that language end-to-end.
- **Why:** Fixes a marketing-vs-reality gap; broadens reach in Morocco.

---

## Phase 5 — Evidence, Regulatory & Sustainability
*Run in parallel from early on; these determine whether the product can scale and survive.*

### Plan 5.1 — Clinical validation study
- **Objective:** Independent evidence it's safe and effective.
- **Tasks:** Start with a **pre/post or pilot** (SafeMom-style: expert panel rates triage urgency safety on N cases); progress toward a cluster design; pre-register; partner with an academic/MoH.
- **Depends on:** 1.1, 1.2.
- **Effort:** XL (longitudinal) · **Risk:** Med.
- **Acceptance:** A registered study protocol + initial safety read-out.
- **Why:** Jacaranda's Harvard RCT and MomConnect/SafeMom de-risked adoption + funding; MamaGuard has none.

### Plan 5.2 — Medical-device classification & QMS
- **Objective:** Get the regulatory posture right for triage software.
- **Tasks:** Classify intended use (EU MDR Rule 11 likely ≥ Class IIa; check Morocco/AMMPS equivalent); lightweight QMS (risk file, change control, versioned clinical content from 1.1); clinical-safety case.
- **Depends on:** 1.1.
- **Effort:** L–XL + 👤 regulatory · **Risk:** High if ignored.
- **Acceptance:** Documented classification + risk management file.
- **Why:** Triage/diagnostic software is generally a regulated device; operating unclassified is a liability.

### Plan 5.3 — Sustainable financing / B2G model
- **Objective:** Avoid the Babyl failure mode (donor/parent dependence).
- **Tasks:** Cost-per-mother model; Ministry-of-Health / public-insurance co-financing path; pricing for any B2B2C; grant pipeline as bridge, not foundation.
- **Depends on:** 4.2 (reporting), 5.1 (evidence).
- **Effort:** M (👤 business) · **Risk:** High (existential).
- **Acceptance:** A costed model + at least one co-financing/MoU path identified.
- **Why:** Babyl reached 2.8M users and still shut down; survivors run on government co-financing.

### Plan 5.4 — Fine-tuned Darija model ("MamaLlama")
- **Objective:** A domain- and dialect-tuned model for cost, quality, and (optionally) on-prem/in-country hosting.
- **Tasks:** Curate Darija maternal Q&A; fine-tune an open model (Llama-class); evaluate vs. OpenAI; consider in-country hosting to ease 1.3 residency.
- **Depends on:** data accumulation, 1.3.
- **Effort:** XL · **Risk:** Med.
- **Acceptance:** A tuned model meeting a quality bar on a Darija eval; documented cost/residency benefit.
- **Why:** Jacaranda's Swahili "UlizaLlama" precedent; can reduce cost and cross-border data exposure.

---

## At-a-glance sequencing
- **Start now, in parallel:** 1.1, 1.3 (legal), 5.1/5.3 groundwork.
- **Then:** 1.2 → 1.4; Phase 2 quick wins (2.1–2.4).
- **Then:** Phase 3 (continuity), Phase 4 (system integration for B2G).
- **Continuous:** Phase 5 (evidence, regulatory, financing).

## Cross-cutting guardrails (apply to every plan)
- Keep CI green (lint + type-check + build); update `schema.sql` with every data change; use the service-role admin client for trusted server writes; never let the LLM downgrade a rule-based urgency; log triage decisions; capture consent before processing/sharing.
