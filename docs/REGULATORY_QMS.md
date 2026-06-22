# REGULATORY_QMS.md — Medical-Device Classification & Quality Management System

> **Working document, not regulatory or legal advice.** This is an
> engineering-maintained living document for **Plan 5.2** (see
> `IMPLEMENTATION_ROADMAP.md` — *Medical-device classification & QMS*). It sets
> out MamaGuard's intended use, a recommended Software-as-a-Medical-Device (SaMD)
> classification, an ISO 14971-style risk file, a clinical safety case, and a
> lightweight ISO 13485-aware QMS anchored to the code that already exists in
> this repository.
>
> Items marked **👤** require sign-off by a qualified **regulatory consultant**
> (medical-device / SaMD) and, for Morocco, a local regulatory affairs adviser
> before any production / clinical deployment. **Nothing here substitutes for a
> notified-body or competent-authority determination.** Keep this file in sync
> with the code paths it cites — most importantly `lib/triage.ts` and its
> `TRIAGE_VERSION`.
>
> Companion documents: `COMPLIANCE.md` (Law 09-08 / CNDP data protection),
> `IMPLEMENTATION_ROADMAP.md` (Plan 1.1 triage engine, Plan 5.1 validation study,
> Plan 5.2 this document).

---

## 1. Intended use & intended purpose

**Intended purpose.** MamaGuard ("Mama AI") is a software system that provides
**conservative danger-sign triage and general maternal-health information** to
pregnant and postpartum women in Morocco, over WhatsApp (and planned SMS/USSD),
in Moroccan Darija (Arabic and Latin script), French and English. It assigns an
**urgency level** to an incoming message and, on high/critical urgency, raises an
alert into a clinician-facing dashboard for human review and follow-up.

**Intended users.**
- *Lay users / patients:* pregnant and postpartum women who send symptom messages
  or voice notes and receive guidance + safety-netting advice.
- *Professional users:* clinicians and (planned, Plan 4.1) community health
  workers who triage, acknowledge and resolve alerts in the dashboard.

**Intended clinical setting.** Community / outpatient antenatal and postpartum
follow-up in a low-resource setting. Not for use in labour wards, ICUs, or as an
in-hospital monitoring device.

**Precise medical claim — what MamaGuard does and does not assert.**

- ✅ It performs **triage**: it estimates the **urgency** with which a patient
  should seek care (`low` / `medium` / `high` / `critical`) from WHO Antenatal
  Care Digital Adaptation Kit (DAK) danger signs, biased toward **over-triage**
  (escalate when uncertain). See `lib/triage.ts`.
- ✅ It provides **general health information and safety-netting** ("if you have
  X, go to the clinic / call emergency services"). The LLM persona
  (`lib/generateMamaResponse.ts`) is instructed to **not give a diagnosis** and to
  **advise seeking professional care when in doubt**.
- ❌ It does **not diagnose** a condition, name a disease, prescribe, dose, or
  determine treatment.
- ❌ It does **not replace** a clinician's assessment. It **complements** care: a
  high/critical result is a prompt for a human to act, not an autonomous decision.

**Contraindications / scope limits (must be surfaced to the patient — Plan 1.2).**
MamaGuard is not an emergency service; in an emergency the patient must call local
emergency services / go to the nearest facility directly. It cannot detect signs
the patient does not report, and transcription of voice notes may be imperfect
(Plan 1.4). These limits should appear in the onboarding consent notice and in
patient-facing disclaimers.

---

## 2. Device classification (SaMD)

MamaGuard's triage function is **software that provides information used to drive
a healthcare decision** (whether/how urgently to seek care). That places it
squarely in the **Software as a Medical Device (SaMD)** category in most regimes.
A general health/wellness information tool would not be a device — but the
**triage urgency claim** is a medical purpose, so the device analysis applies.

### 2.1 EU MDR Rule 11 (MDR 2017/745, Annex VIII)

Rule 11 governs software intended to provide information used for decisions with
diagnosis or therapeutic purposes:

- Software providing information used to take decisions with diagnosis/therapy
  purposes is **Class IIa**;
- **except** if such decisions may cause **death or an irreversible deterioration**
  → **Class III**, or **serious deterioration / surgical intervention** →
  **Class IIb**;
- software intended to monitor physiological processes is IIa (IIb if vital
  parameters where variations could result in immediate danger);
- all other such software is **Class I**.

**Application to MamaGuard.** The triage output drives a decision on the urgency
of seeking care for **obstetric danger signs** — vaginal bleeding, eclampsia
(convulsions), pre-eclampsia clusters, absent fetal movement, postpartum
haemorrhage and postpartum self-harm (`lib/triage.ts`, `DANGER_SIGNS`,
`POSTPARTUM_DANGER_SIGNS`, the pre-eclampsia `ESCALATIONS` rule). A
**false-negative (under-triage)** on any of these can plausibly contribute to
**death or irreversible deterioration** of mother or fetus.

- A defensible baseline reading of Rule 11 is **Class IIa** (information for a
  care decision).
- A conservative reading — given the conditions in scope can be life-threatening —
  argues the worst-case harm reaches "death or irreversible deterioration," which
  would push toward **Class IIb / III**.

The **counter-argument** (used by some triage/symptom-checker vendors) is that the
software only signposts *seeking care* and a human clinician remains in the loop
(Plan 1.2 alert queue), so the device does not itself *cause* the harmful
decision. That argument is reasonable but **not dispositive** and is exactly the
kind of judgement a notified body must rule on. **👤** Do not self-certify a class.

### 2.2 IMDRF SaMD risk categorisation

IMDRF (N12) categorises SaMD by two axes — *significance of the information* and
*state of the healthcare situation*:

- **Significance of information:** MamaGuard **drives clinical management** /
  triage (it raises an alert and sets `risk_level`) — stronger than merely
  "informing" management.
- **Healthcare situation:** the in-scope danger signs are **serious / critical**
  (obstetric emergencies).

"Drive clinical management" + "serious-to-critical situation" lands in the
**higher IMDRF categories (III–IV)**, consistent with the conservative EU MDR
reading above. This corroborates treating MamaGuard as a higher-risk SaMD rather
than a wellness app.

### 2.3 Morocco regime

Morocco regulates medical devices under **Law No. 84-12** on medical devices and
its implementing decrees; market access historically runs through the health
ministry's medical-device directorate, with the regulatory function consolidating
under the national medicines/health-products agency (often referred to as the
**AMMPS** — *Agence Marocaine des Médicaments et des Produits de Santé*). The
classification rules broadly track the EU four-class system (I / IIa / IIb / III),
which makes the EU MDR analysis a usable starting point.

- **👤 open:** Confirm the **current Moroccan SaMD classification rules and the
  competent authority's name/scope** (the agency landscape has been changing);
  confirm whether software-only devices are explicitly addressed; confirm
  registration / conformity route and any local representative requirement.
- Note the overlap with `COMPLIANCE.md`: data-protection authorization (Law 09-08
  / CNDP) is a **separate** track from device classification and **both** are
  required.

### 2.4 Recommended classification (working position)

> **Working position: treat MamaGuard's triage function as SaMD, EU MDR
> Rule 11, and design/document to a Class IIa baseline while preparing for a
> Class IIb determination** (the in-scope obstetric emergencies can be
> life-threatening). Mirror this with **IMDRF category III–IV**. For Morocco,
> assume an equivalent IIa–IIb class under Law 84-12 / the national agency, to be
> confirmed. **👤** A regulatory consultant and the notified body / competent
> authority make the binding call; this document exists so we are not "operating
> unclassified" (the Plan 5.2 risk).

Designing to the higher of the plausible classes is the conservative choice and is
consistent with the product's own conservative triage philosophy.

---

## 3. Risk management (ISO 14971-style risk file)

This section is the **risk file outline**. ISO 14971 process: identify
hazards → estimate risk (severity × probability) → control → evaluate residual
risk → overall residual-risk acceptability (the safety case, §4) → feed
post-market data back (§5).

**Dominant harm.** For a maternal triage tool the dominant harm is
**under-triage (false negative)**: a real danger sign is missed or rated too low,
delaying care for an obstetric emergency. The whole engine is therefore biased to
**over-triage** — "uncertainty escalates, never downgrades" (`lib/triage.ts`
header; Plan 1.1). Over-triage (false positive) is a real but *secondary* harm
(clinician alert fatigue, patient anxiety), accepted as the price of recall.

### 3.1 Hazard / mitigation table

| # | Hazard (failure mode) | Potential harm | Severity | Current mitigation (in-repo) | Residual risk / open item |
|---|---|---|---|---|---|
| H1 | **Under-triage / false negative** — danger sign rated too low or missed | Delayed care for obstetric emergency → death / irreversible deterioration | **Critical** | Deterministic, conservative WHO-ANC-DAK rule engine biased to recall; uncertainty escalates; co-occurrence escalation (e.g. pre-eclampsia: headache + blurred vision/oedema → critical). `lib/triage.ts` (`DANGER_SIGNS`, `ESCALATIONS`, `assessTriage`). Versioned (`TRIAGE_VERSION = "who-anc-dak-v2"`) and vignette-tested (`lib/triage.vignettes.mjs`). | Pattern coverage is finite; novel phrasings can be missed. Validation study (Plan 5.1) must quantify the false-negative rate. **👤** acceptability threshold. |
| H2 | **Mistranscription of Darija audio** — Whisper mis-hears a voice note | Danger sign never reaches the rule engine → under-triage (folds into H1) | **Critical** | Forced `language: 'ar'`; Darija medical-vocabulary priming prompt; `temperature: 0`. `lib/transcribe.ts`. Plan 1.4 hardening planned (confidence signal, clarifying question on low confidence). | WER on Darija is unmeasured; low-confidence audio does not yet *escalate*. Open: Plan 1.4 confidence-based conservative escalation. |
| H3 | **Whisper silence/noise hallucination** — model invents text from silence | False content → spurious triage, or masking of a real message | Medium | Hallucination guard: drops transcripts that are only known hallucination phrases ("thanks for watching", "اشترك", punctuation-only) or where all segments have `no_speech_prob > 0.6`; returns `""` (callers ignore empty). `lib/transcribe.ts` (`HALLUCINATION_PATTERNS`, `isLikelyHallucination`). | Pattern list is heuristic; an empty return on a *real* but unclear note loses information. Couple with H2's clarifying-question plan. |
| H4 | **LLM hallucination** — reply invents unsafe medical advice | Patient acts on wrong info; false reassurance | High | LLM is **reply-only**, never the triage decider; persona forbidden from diagnosing and instructed to advise professional care when in doubt; `FALLBACK_DARIJA` on empty/failed completion; planned retrieval grounding from a vetted content library (Plan 2.3). `lib/generateMamaResponse.ts`. | Free-form generation residual risk remains until content-grounded (Plan 2.3). |
| H5 | **LLM downgrades rule urgency** — model softens/contradicts a critical result | Patient reassured out of seeking emergency care → under-triage | **Critical** | Hard architectural separation: `risk_level` and `alerts` are written from the **rule engine only**; the reply layer cannot alter urgency. `app/api/webhook/route.ts` ("`risk_level` is set from the RULE engine only — the LLM reply layer can never downgrade it"). Cross-cutting guardrail in `IMPLEMENTATION_ROADMAP.md`. | Prompt-level "never contradict" is defence-in-depth; the *structural* guarantee is that urgency is computed before and independently of the reply. |
| H6 | **Missed escalation** — a high/critical result never reaches a human | Emergency goes unactioned | **Critical** | On `high`/`critical`, an `alerts` row is inserted with a status workflow (`active` → `acknowledged` → `resolved`) for the human-in-the-loop queue (Plan 1.2). `app/api/webhook/route.ts`; `schema.sql` (`alerts` table + `idx_alerts_status`). | Needs SLA timers + assignment/ownership (Plan 1.2 acceptance: ≤1h on high/critical). Delivery failure of the alert to a clinician is not yet monitored. |
| H7 | **Lost auditability** — cannot reconstruct why a decision was made | Cannot investigate an incident; no change-control evidence | Medium | Every assessment is logged with version + matched signs + escalation flag into `messages.metadata` (`risk`, `triage_escalated`); dedicated immutable `audit_log` table (`triage.assessed`, `alert.acknowledged`, `alert.resolved`) retained even after patient deletion (`ON DELETE SET NULL`). `app/api/webhook/route.ts`; `schema.sql`. | Confirm audit entries are actually written on every path (webhook + cron + dashboard actions). |
| H8 | **Data breach / unauthorised access** | Disclosure of sensitive health data | High | Row Level Security (authenticated clinicians only; anon denied); service-role key server-only; secrets git-ignored. `schema.sql`; `utils/supabase/*`; `CLAUDE.md`. Full treatment in `COMPLIANCE.md`. | See `COMPLIANCE.md` (CNDP authorization, DPAs, region, encryption-at-rest, breach-notification runbook). |
| H9 | **Stale / wrong clinical content** — rules drift from current WHO guidance | Systematic mis-triage at scale | High | Clinical content is a single versioned module (`TRIAGE_VERSION`) under change control (§6) with vignette regression tests. | Needs a periodic clinical-content review cadence tied to WHO ANC DAK updates (§5 PMS). |

### 3.2 Risk controls — order of preference (ISO 14971)

1. **Inherent safety by design:** rules decide urgency, not the LLM (H5); conservative over-triage bias (H1); transcription hallucination guard (H3).
2. **Protective measures:** human-in-the-loop alert queue (H6); audit log (H7); RLS (H8).
3. **Information for safety:** patient disclaimers / scope limits (§1); "not a diagnosis, call emergency services" notice (Plan 1.2); clinician training on the tool's limits.

---

## 4. Clinical safety case

**Claim.** The **residual risk** of MamaGuard's triage function is **acceptable**
for its intended use (conservative danger-sign triage that complements, and is
gated by, a human clinician), given the controls in §3.

**Argument structure (GSN-style: claim → argument → evidence).**

- **Top claim:** MamaGuard is acceptably safe for community antenatal/postpartum
  danger-sign triage.
  - **Arg A — the dominant harm (under-triage, H1/H2) is minimised by design.**
    - *Evidence:* deterministic, conservative, WHO-ANC-DAK-grounded engine that
      escalates on uncertainty (`lib/triage.ts`); the LLM is structurally barred
      from lowering urgency (H5; `app/api/webhook/route.ts`); danger-sign coverage
      regression-tested by vignettes (`lib/triage.vignettes.mjs`).
  - **Arg B — a human is always in the loop for consequential outputs.**
    - *Evidence:* high/critical results raise an `alerts` row in a clinician queue
      with an `active → acknowledged → resolved` workflow (`schema.sql`,
      `app/api/webhook/route.ts`); the device does not autonomously treat or
      diagnose (§1). This supports the Rule 11 argument that the software does not
      itself *cause* a harmful decision.
  - **Arg C — every decision is reconstructable.**
    - *Evidence:* versioned assessments + immutable `audit_log` (H7), enabling
      incident investigation and the PMS feedback loop (§5).
  - **Arg D — the residual rate is quantified and judged acceptable by clinicians,
    not by us.**
    - *Evidence: **to be supplied by Plan 5.1** (clinical validation study).* The
      safety case is **provisional** until 5.1 delivers an expert-panel safety
      read-out (SafeMom-style: clinicians rate triage-urgency safety on N real
      cases, with the **false-negative / under-triage rate** as the primary safety
      endpoint). Pre-registration + an academic/MoH partner give independence.
  - **Arg E — data-protection risk (H8) is handled in a dedicated track.**
    - *Evidence:* `COMPLIANCE.md` (Law 09-08 / CNDP).

**Acceptance criteria for closing the safety case (👤 regulatory + clinical):**
a defined maximum acceptable under-triage rate on the Plan 5.1 cohort; zero
"never events" (e.g. a critical danger sign rated `low`) on the validation set;
demonstrated alert delivery within the Plan 1.2 SLA. Until these are met, the
safety case status is **OPEN / provisional**.

---

## 5. QMS essentials (lightweight, ISO 13485-aware)

A full ISO 13485 QMS is out of scope for the current stage; this is a
proportionate, code-anchored subset that can grow into one.

**5.1 Document control.** Controlled documents: this file, `COMPLIANCE.md`,
`IMPLEMENTATION_ROADMAP.md`, `schema.sql`, `CLAUDE.md`. They live **in the git
repository**, so git history *is* the document-control record (author, date,
diff, review via PR). Each controlled doc carries the "working document" header
and a sync obligation to the code it cites.

**5.2 Change control.** Two layers:
- *Software change control:* every change lands via pull request and must pass the
  CI gates (§5.3). Cross-cutting guardrails in `IMPLEMENTATION_ROADMAP.md` apply
  (keep CI green; update `schema.sql` with data changes; never let the LLM
  downgrade rule urgency; log triage decisions).
- *Clinical-content change control:* changes to triage logic are gated on a
  `TRIAGE_VERSION` bump + vignette tests + clinical review — detailed in §6.

**5.3 Verification evidence (CI gates).** The CI workflow
(`.github/workflows/ci.yml`) runs on every PR and is the standing verification
record: **lint** (`npm run lint`), **type-check** (`npx tsc --noEmit`), and
**build** (`npm run build`). These prove the software builds and is type-sound.
- **Gap (recommend closing): the triage vignette suite is *not yet wired into
  CI*.** It must be run manually
  (`node --experimental-strip-types --test lib/triage.vignettes.mjs`). For the
  clinical-content change control in §6 to be real verification evidence, **add
  the vignette run as a required CI step** so a regression in a danger-sign rule
  fails the build. *(Documentation-only note here; do not change CI as part of
  authoring this doc.)* **👤/eng follow-up.**

**5.4 Release records.** A release is a tagged/merged commit on the default
branch with green CI. Recommended minimum release record per release: the commit
SHA, the `TRIAGE_VERSION` in effect, the vignette result, and a one-line release
note (see §6) — captured in PR/release notes. No test framework beyond the
vignette runner exists in this project (per `CLAUDE.md`); do not assume one.

**5.5 Post-market surveillance (PMS) & vigilance.** Once live:
- *Surveillance signals:* alert acknowledge/resolve outcomes and timings (the
  `alerts` workflow + future SLA timers, Plan 1.2), audit-log review
  (`audit_log`), transcription drop rate (H3), and clinician-reported
  mis-triage. These feed back into rule changes (§6) and the risk file (§3).
- *Vigilance:* define what constitutes a **reportable incident** (e.g. a confirmed
  under-triage that contributed to harm) and the reporting path to the competent
  authority. **👤** thresholds and authority reporting obligations (Morocco) are a
  regulatory-consultant item.
- *Periodic clinical review:* re-review the danger-sign rules against the current
  WHO ANC DAK on a defined cadence (H9).

**5.6 Complaint handling.** Establish a single intake for patient/clinician
complaints, triaged for safety impact; safety-relevant complaints open a risk-file
review (§3) and, where applicable, a vigilance report (§5.5). Link each complaint
to the relevant `TRIAGE_VERSION` and audit entries for traceability. **👤** define
the SLA and ownership.

---

## 6. Change control for clinical rules

The triage rules in `lib/triage.ts` are the regulated clinical core. Any change
to danger-sign patterns, urgency levels, negation handling, or escalation rules
follows this flow:

1. **Propose** the change in a PR that edits `lib/triage.ts` (e.g. adding a
   pattern to `DANGER_SIGNS`/`POSTPARTUM_DANGER_SIGNS`, or an `ESCALATIONS` rule),
   with a rationale citing the WHO ANC DAK / clinical source.
2. **Bump `TRIAGE_VERSION`** (e.g. `who-anc-dak-v2` → `who-anc-dak-v3`). This is
   mandatory: the version is stamped onto **every** assessment
   (`TriageResult.version`, written to `messages.metadata` and used in
   `audit_log`), so a version bump makes the change auditable and reproducible and
   prevents silent clinical drift (H9).
3. **Update / add vignette tests** in `lib/triage.vignettes.mjs` covering the new
   or changed behaviour, then run them:
   `node --experimental-strip-types --test lib/triage.vignettes.mjs`. The existing
   vignettes (negated bleeding → `low`, pre-eclampsia cluster → `critical`,
   postpartum haemorrhage → `critical`, etc.) must continue to pass — no
   regression in danger-sign recall.
4. **Clinical + code review.** A reviewer with clinical input confirms the change
   does not reduce conservatism (no danger sign's urgency is lowered without
   explicit, justified, reviewed rationale — the LLM-downgrade prohibition (H5)
   applies to humans changing rules too). Verify the cross-cutting guardrails in
   `IMPLEMENTATION_ROADMAP.md`.
5. **Release note.** Record: old → new `TRIAGE_VERSION`, what danger-sign behaviour
   changed and why (clinical source), vignette result, reviewer. This is the
   per-release clinical-content record (§5.4).
6. **Feed the risk file.** If the change addresses or introduces a hazard, update
   §3 and re-evaluate the safety case (§4).

**Files in this flow:** `lib/triage.ts` (the rules + `TRIAGE_VERSION`),
`lib/triage.vignettes.mjs` (tests), `app/api/webhook/route.ts` (consumer that
stamps the version into `messages.metadata` and `audit_log`), `schema.sql`
(`messages.metadata`, `audit_log`), `.github/workflows/ci.yml` (gates; see the
§5.3 recommendation to add the vignette run).

---

## 7. Roadmap to conformity

Phased checklist. ✅ = done in-repo today · ☐ = to do · **👤** = needs a
regulatory consultant (and, where noted, a Moroccan regulatory-affairs adviser).

### Phase A — Foundations already in place (evidence the device is buildable safely)
- [x] Deterministic, conservative, WHO-ANC-DAK triage engine — `lib/triage.ts`.
- [x] Clinical content **versioned** via `TRIAGE_VERSION`.
- [x] Vignette regression tests — `lib/triage.vignettes.mjs`.
- [x] LLM structurally barred from downgrading rule urgency — `app/api/webhook/route.ts`.
- [x] Human-in-the-loop alert queue with status workflow — `alerts` table, `schema.sql`.
- [x] Immutable audit log of triage/alert actions — `audit_log`, `schema.sql`.
- [x] Transcription hallucination guard — `lib/transcribe.ts`.
- [x] CI gates: lint + type-check + build — `.github/workflows/ci.yml`.
- [x] Data-protection posture documented — `COMPLIANCE.md`.

### Phase B — Documentation & QMS hardening (engineering-owned)
- [ ] Add the **vignette suite to CI** as a required gate (§5.3).
- [ ] Define and record **release records** (SHA + `TRIAGE_VERSION` + vignette result + note) per §5.4.
- [ ] Implement **SLA timers + alert assignment/ownership** on high/critical alerts (Plan 1.2).
- [ ] Monitor/alert on **alert-delivery failure** to a clinician (H6).
- [ ] Add **Plan 1.4** transcription confidence → conservative escalation (H2).
- [ ] Stand up a **complaint-intake** channel and PMS signal review (§5.5–5.6).
- [ ] Establish a **periodic WHO-ANC-DAK clinical-content review** cadence (H9).

### Phase C — Clinical evidence (Plan 5.1)
- [ ] Pre-register a **validation study protocol** (SafeMom-style expert panel).
- [ ] Produce an initial **safety read-out** with the under-triage rate as primary endpoint.
- [ ] **Close the safety case** (§4) against agreed acceptance criteria. **👤 clinical + regulatory.**

### Phase D — Regulatory classification & conformity (👤 consultant-led)
- [ ] **👤** Confirm SaMD status and **binding class** under **EU MDR Rule 11** (IIa vs IIb/III) with a notified body.
- [ ] **👤** Confirm the **Morocco** medical-device regime (Law 84-12 / national agency / "AMMPS" equivalent): classification, conformity route, local-representative requirement.
- [ ] **👤** Reconcile classification with the **IMDRF** category (III–IV working position).
- [ ] **👤** Compile the **technical documentation / device file** (intended use, classification, risk file §3, safety case §4, clinical evidence Phase C, QMS §5).
- [ ] **👤** Determine **vigilance / incident-reporting** obligations and thresholds (§5.5).
- [ ] **👤** Confirm interaction between device registration and the **CNDP / Law 09-08** track (`COMPLIANCE.md`) — both required, separate filings.
- [ ] **👤** Decide conformity-assessment / certification route and timeline before clinical deployment.

> **Bottom line:** the engineering controls for a safe SaMD largely exist
> (Phase A). What is missing is (1) wiring the clinical tests into CI and the QMS
> records (Phase B), (2) the independent clinical evidence to close the safety
> case (Phase C, Plan 5.1), and (3) the **binding** classification and conformity
> determination, which only a regulatory consultant / competent authority can give
> (Phase D). Operating *unclassified* is the liability Plan 5.2 exists to remove.
