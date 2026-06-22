# Clinical Validation Plan (Plan 5.1)

*Working document — study protocol scaffold, not a registered protocol or clinical advice.*

## Objective
Generate independent evidence that MamaGuard's triage is **safe** (does not under-triage emergencies) and **effective** (improves ANC engagement / timely escalation), to de-risk adoption and unlock B2G funding (Plan 5.3).

## Why this matters (evidence)
- *Nature Medicine 2026*: LLM triage **under-triaged 52% of emergencies**. Under-triage (telling a sick patient she's fine) is the dominant harm.
- Symptom checkers historically ~57% triage accuracy; safety depends on a **conservative** bias.
- Peers that scaled (Jacaranda's Harvard RCT, MomConnect/SafeMom) did so on the back of validation evidence. MamaGuard currently has none — this plan closes that gap.

## Design (phased)
1. **Phase A — retrospective safety eval (now, automated).** Run the deterministic engine (`lib/triage.ts`) over a labeled case set and measure the **under-triage rate** on high/critical cases. This is implemented and CI-gateable:
   - Dataset: `eval/triage-cases.json` (versioned, multilingual, antenatal + postpartum).
   - Runner: `eval/triage-safety.mjs` — reports exact agreement, under-triage, over-triage, and **fails (exit 1) on any dangerous under-triage** of a high/critical case.
   - Run: `node --experimental-strip-types eval/triage-safety.mjs`.
   - Current read-out: N=35, exact 100%, **under-triage 0%**, over-triage 0%.
2. **Phase B — expert-panel safety rating (SafeMom-style).** Recruit ≥2 obstetricians/midwives to independently rate triage urgency safety on **N≥100** real (de-identified, consented per Plan 1.3) or simulated vignettes. Primary safety endpoint: **proportion of emergencies under-triaged** (target ≈0%, pre-specified non-inferiority/acceptability bound). Measure inter-rater agreement (κ) and engine-vs-panel agreement.
3. **Phase C — prospective pilot (pre/post).** In 1–2 facilities: ANC visit completion, time-to-escalation for danger signs, alert acknowledgement SLA (Plan 1.2), patient-reported usefulness. Pre/post comparison.
4. **Phase D — cluster design.** Progress toward a cluster-randomized or stepped-wedge design with an academic/MoH partner; pre-register (e.g., PACTR / ClinicalTrials.gov).

## Endpoints
- **Primary (safety):** emergency under-triage rate.
- **Secondary:** engine–clinician agreement (κ), over-triage rate (resource burden), ANC adherence, time-to-care for flagged danger signs, EPDS escalation appropriateness (Plan 3.2), false-negative review of resolved alerts.

## Data & ethics
- De-identification and **consent** per `COMPLIANCE.md` / Plan 1.3 before any real-data use.
- IRB/ethics approval + CNDP authorization for the dataset.
- Every assessment is already versioned (`TRIAGE_VERSION`) and logged (`audit_log`), giving a reproducible audit trail for the study.

## Governance
- The labeled eval set grows with clinician-reviewed real cases; each addition is reviewed and the harness re-run in CI.
- A regression in `eval/triage-safety.mjs` (any dangerous under-triage) blocks release — the safety gate is part of the change-control story in `docs/REGULATORY_QMS.md` (Plan 5.2).

## Milestones
- [x] Automated under-triage safety harness + labeled dataset (Phase A).
- [x] Safety gate wired to fail on dangerous under-triage.
- [ ] Expand dataset to N≥100 clinician-labeled cases (👤 clinical).
- [ ] Recruit expert panel; run Phase B rating; compute κ (👤 clinical).
- [ ] Ethics + CNDP approval for prospective data (👤 legal/clinical).
- [ ] Pre-register pilot protocol; identify facility + academic/MoH partner (👤).
- [ ] Run pre/post pilot; publish safety read-out.
