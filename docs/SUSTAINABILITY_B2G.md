# MamaGuard — Sustainable Financing & B2G Model (Plan 5.3)

*Working document. Aligns to `IMPLEMENTATION_ROADMAP.md` Plan 5.3 ("Sustainable financing / B2G model"), which depends on Plan 4.2 (analytics & government reporting) and Plan 5.1 (clinical evidence), and references Plan 5.4 (fine-tuned in-country model) and Plan 2.2 (SMS/USSD fallback). Drawn from `COMPETITIVE_ANALYSIS.md`.*

> **All financial figures in this document are illustrative planning assumptions, not vendor quotes or signed prices.** They exist to frame the unit-economics conversation and to produce the *costed model* that Plan 5.3's acceptance criteria require. Every number must be replaced with a real quote/contract before being used externally or in a budget submission.

---

## 1. Why this matters

Sustainability is not a "Phase 5 nice-to-have" — it is existential, and the competitive record proves it.

- **The Babyl failure mode (donor/parent dependence).** Babyl/Babylon (Rwanda) reached **~2.8M users and ~3.9M consultations**, had peer-reviewed evidence, and still **shut down in September 2023** — not because the product failed clinically, but because its parent company (Babylon) went bankrupt. A program funded out of a single parent's balance sheet or a single donor grant inherits that funder's mortality. Scale does not buy survival; *financing structure* does.
- **The survivors run on public co-financing.** Every program in `COMPETITIVE_ANALYSIS.md` that is still operating at scale has woven itself into a **government budget line**:
  - **Jacaranda PROMPTS** (Kenya): non-profit, with **county-government co-financing at roughly $0.74 per mother** (program-reported).
  - **MomConnect** (South Africa): **government-owned** (National Department of Health) and donor-supplemented.
  - **Khushi Baby** (India): nonprofit funded by **state-government contracts ($20M+)**.
  These are the models to emulate. Grants and pilots got them in the door; *recurring public co-financing* kept them alive.
- **Implication for MamaGuard.** The objective of Plan 5.3 is explicitly to **avoid the Babyl failure mode**. That means designing, from now, toward a **Morocco Ministry of Health (MoH) / public-insurance co-financing arrangement priced per enrolled mother**, with grants used only as a *bridge* to that arrangement — never as the foundation.

---

## 2. Cost-per-mother model

To price a per-mother co-financing offer we must know our **variable cost per mother per month**. Below is a bottom-up breakdown grounded in MamaGuard's *actual* stack (the models and services wired into this codebase), followed by an illustrative monthly estimate.

### 2.1 The real cost drivers (from this codebase)

| Driver | Where in the code | What we pay for | Cost behavior |
|---|---|---|---|
| **WhatsApp Cloud API** | `app/api/webhook/route.ts`, `app/api/whatsapp/send/route.ts` | Meta charges **per 24h conversation**, by category (service / utility / marketing) and country. Proactive check-ins (`app/api/cron/check-in`) and ANC reminders (Plan 2.1) are *business-initiated* (utility/marketing) and cost more than user-initiated *service* windows. | Per-conversation, per-mother; the largest "always-on" line. |
| **OpenAI Whisper transcription** | `lib/transcribe.ts` (`whisper-1`, forced `language: 'ar'`) | Billed **per minute of audio** transcribed. Only incurred for voice messages, not text. | Scales with voice-message volume & length. |
| **OpenAI chat completion** | `lib/generateMamaResponse.ts` (default `gpt-4o-mini`) | Billed **per input + output token**. Input includes `MAMA_SYSTEM_BASE` + injected patient context + last 5 messages; output is the Darija reply. | Scales with message count × prompt size. Cheap on `gpt-4o-mini`; rises sharply if upgraded to a larger model. |
| **ElevenLabs TTS** | `lib/speak.ts` (`eleven_multilingual_v2`) | Billed **per character** synthesized. **Currently NOT wired into the webhook** (text-only replies today) — so this is **$0 today** but a real future line if voice replies ship. | Per-reply character count, *if enabled*. |
| **MiniMax fallback** | `lib/minimax.ts`, `lib/generateMamaResponse.ts` (`abab6.5s-chat`) | Per-token, used only when `OPENAI_API_KEY` is unset. Generally cheaper than OpenAI; affects cost only in the fallback configuration. | Substitutes for OpenAI cost in fallback mode. |
| **Supabase hosting** | `utils/supabase/*`, `schema.sql` | Postgres + Realtime + storage. A **fixed/tiered platform cost**, not per-mother — it amortizes across the whole cohort. | Fixed/step cost; per-mother share falls as N grows. |
| **SMS gateway (Twilio)** | Plan 2.2 (`lib/channels/` — not yet built) | Per-segment SMS for the **fallback channel** reaching the ~20% of mothers without smartphones. No audio/LLM-voice on this channel (graceful degradation). | Per-segment; cheaper per message than WhatsApp+AI but feature-limited. |

### 2.2 Illustrative per-mother-per-month estimate

**Stated assumptions (illustrative):**
- A mother exchanges ~**40 WhatsApp messages/month** (mix of proactive check-ins, ANC reminders, and her replies), spanning ~**8 distinct 24h conversation windows**, of which ~5 are business-initiated.
- ~**30%** of inbound messages are **voice notes** averaging ~**20 seconds**, transcribed by Whisper.
- LLM replies average a few hundred tokens in/out on **`gpt-4o-mini`**.
- **Voice replies (ElevenLabs) are OFF** (matches today's webhook).
- Supabase is a **shared platform cost** amortized over the cohort.
- SMS line applies **only to the ~20% on the fallback channel**.

| Component | Illustrative monthly cost / mother | Note |
|---|---|---|
| WhatsApp conversations (~8 windows) | **$0.15 – $0.45** | Dominated by business-initiated windows; Morocco-specific rates TBD. |
| Whisper transcription | **$0.02 – $0.05** | ~12 voice notes × ~20s. |
| GPT chat (`gpt-4o-mini`) | **$0.01 – $0.04** | Cheap at this tier; the *model choice* is the swing factor. |
| ElevenLabs TTS | **$0.00 today** | Not wired in; would add ~$0.05–$0.20 if enabled. |
| Supabase (amortized) | **$0.02 – $0.10** | Falls toward zero per-mother as N grows. |
| SMS fallback (blended, ~20% of cohort) | **$0.02 – $0.06** | Cheaper per message, feature-limited. |
| **Illustrative blended total** | **≈ $0.25 – $0.70 / mother / month** | **Planning placeholder only.** |

This range is deliberately wide and **conservative-leaning**. The headline planning number we will use for the break-even model below is an **illustrative ~$0.50/mother/month**. Note this lands in the same order of magnitude as Jacaranda's reported **~$0.74/mother** co-financing rate — a useful external sanity check, though Jacaranda's figure is SMS-based and likely includes nurse-helpdesk labor we have not yet costed (see §5).

### 2.3 Where Plan 5.4 reduces cost

The single largest *controllable* AI cost driver is the LLM. **Plan 5.4 (fine-tuned in-country "MamaLlama")** attacks it directly:
- Replacing per-token OpenAI/MiniMax calls with a **self-/in-country-hosted fine-tuned Darija model** converts a **per-message variable cost into a largely fixed hosting cost**, which amortizes across the cohort like Supabase does — so cost per mother *falls as N rises*.
- A Darija-tuned model also improves quality (fewer clarifying round-trips → fewer messages → lower WhatsApp + Whisper cost) and **eases Plan 1.3 data-residency** by keeping transcripts in-country (a B2G selling point, see §4).
- **Caveat:** fine-tuning + hosting has real upfront and fixed cost; it only *reduces* per-mother cost above a break-even cohort size. Model the crossover explicitly before committing.

> **Not yet costed here (flag for the costed model):** the **nurse/clinician helpdesk labor** (Plan 1.2) is likely the dominant *operating* cost at scale and is **not a software line** — it must be added to any real per-mother figure. The numbers above are *technology* cost only.

---

## 3. Revenue / financing paths

### (a) MoH / public-insurance (AMO) co-financing per enrolled mother — *primary target*

Morocco is mid-rollout of **universal health coverage (AMO — Assurance Maladie Obligatoire)**, generalizing coverage to the population formerly served by **RAMED**. The strategic target is a **per-enrolled-mother subsidy** paid from a public budget line (national MoH program and/or AMO), mirroring Jacaranda's county co-financing and Khushi Baby's state contracts.

- **Pros:** Recurring, scalable, survives a single funder's exit (the Babyl lesson); aligns incentives with national maternal-mortality goals; politically durable once it is a budget line.
- **Cons:** Long sales/procurement cycle; requires Plan 4.2 reporting + Plan 5.1 evidence + Plan 1.3 CNDP/Law 09-08 compliance as preconditions; subject to public budget cycles and political change; likely requires a public tender/framework agreement.

### (b) B2B2C via clinics / private insurers

Sell MamaGuard as a per-enrolled-mother service to **private clinics, hospital groups, or private health insurers**, who offer it to their pregnant members (the Maven/mDoc B2B2C pattern).

- **Pros:** Faster sales cycle than government; provides early revenue and reference deployments that *de-risk the eventual MoH deal*; private payers can fund the pilots that generate Plan 5.1 evidence.
- **Cons:** Smaller reach (private-insured population is a minority); does not by itself reach the rural, underserved mothers who are MamaGuard's mission; can distort the product toward urban/affluent users if over-indexed.

### (c) Grants — a *bridge*, not a foundation

Donor/foundation grants (the Wired Mothers / Danida research-funding pattern) to fund the **clinical validation study (5.1), CNDP compliance work (1.3), and initial deployment** before co-financing revenue exists.

- **Pros:** Non-dilutive; appropriate for evidence-generation and public-good infrastructure; expected by global-health funders for this category.
- **Cons:** **This is exactly the Babyl trap if treated as the foundation.** Grants are episodic and end. Use them strictly as a **time-boxed bridge** with an explicit plan to transition each grant-funded activity onto recurring co-financing (a) or B2B2C (b). Every grant proposal should name the sustainability successor.

**Recommended posture:** grants (c) fund the runway and evidence → B2B2C (b) provides early revenue and reference sites → MoH/AMO co-financing (a) is the durable foundation. Sequence them; do not depend on any one alone.

---

## 4. B2G value proposition — what the Ministry of Health buys

The MoH is not buying a chatbot. It is buying **measurable progress against maternal mortality, with the reporting to prove it** — which is precisely what Plan 4.2 delivers.

- **Program reporting the MoH can use (Plan 4.2, partly built).** Aggregate metrics (reach, ANC-visit adherence, alerts raised/resolved, outcomes), **facility- and region-level dashboards**, and **CSV / scheduled exports**, with indicators **aligned to the WHO Antenatal Care DAK programme indicators**. This converts MamaGuard from an app into a **national maternal-health surveillance and adherence instrument** — the same role that makes Jacaranda, Khushi Baby, and MomConnect fundable by their governments.
- **Direct line to Morocco's maternal-mortality reduction goals.** Morocco has driven its MMR down substantially but retains a **rural/urban gap**; the national priority is reaching underserved rural mothers and raising ANC-visit completion. MamaGuard's Darija + WhatsApp + SMS-fallback (Plan 2.2) reach, plus conservative WHO-DAK triage (Plan 1.1) and ANC reminders (Plan 2.1), map directly onto those targets — and Plan 4.2 lets the MoH *see the movement* by region.
- **Evidence and compliance as procurement enablers.** Plan 5.1 (clinical validation) gives the safety/effectiveness read-out a procurement officer needs; Plan 1.3 (CNDP authorization, Law 09-08, in-country data residency — strengthened by Plan 5.4 in-country hosting) removes the legal blocker to a government contract.
- **What the MoH buys, concretely:** *per-mother monitored* (reach), *ANC adherence uplift*, *danger signs caught and escalated*, *region dashboards for planning* — all exportable for national reporting, at an illustrative cost per mother far below the cost of a missed obstetric emergency.

---

## 5. Unit economics / break-even (illustrative)

A deliberately simple model to frame the conversation. **All figures illustrative.**

Let:
- `c` = technology cost per mother/month (illustrative **$0.50**, from §2.2)
- `L` = helpdesk/clinical labor per mother/month (**not yet costed** — placeholder, must be added)
- `p` = co-financing paid per enrolled mother/month (the price we propose to the MoH/payer)
- `N` = enrolled mothers
- `F` = fixed monthly cost (Supabase tier, hosting, fixed Plan-5.4 model hosting, ops)

**Break-even:** `p × N  ≥  (c + L) × N  +  F`, i.e. per-mother margin `(p − c − L)` must cover fixed cost `F` across the cohort.

**Illustrative scenario (technology cost only, L set aside):**
- If `c ≈ $0.50` and we propose `p ≈ $0.74` (the Jacaranda reference point), per-mother gross margin ≈ **$0.24**.
- With `F ≈ $5,000/month` (illustrative fixed ops + hosting), break-even ≈ **$5,000 / $0.24 ≈ ~21,000 enrolled mothers** — *before* adding helpdesk labor `L`, which will raise this materially.

**Sensitivities:**
- **Model-cost reduction (Plan 5.4):** moving the LLM from per-token to fixed in-country hosting lowers `c` (toward ~$0.40 or below at scale) *and* shifts spend into `F`. Net effect: **margin per mother widens as N grows**, improving economics specifically in the large-cohort regime that a national MoH deal implies — the opposite of a per-token model, whose cost grows linearly with usage.
- **Channel mix (Plan 2.2 SMS):** every mother served on **SMS instead of WhatsApp+AI** is cheaper per message but feature-limited (no voice, no rich LLM). A higher SMS share **lowers `c`** but reduces the clinical/engagement value — so optimize for *appropriate* channel per patient (`has_smartphone`), not for cost alone.
- **Message volume:** `c` scales with messages/mother; tightening proactive-message frequency (cron check-ins, reminders) is a direct cost lever.
- **Helpdesk labor `L`:** the dominant unknown and likely the largest line at scale. The next costing iteration must quantify nurse time per mother (Plan 1.2 SLAs) — this, not software, will set the real break-even.

---

## 6. Milestones to a costed model + MoU

*Acceptance for Plan 5.3: "A costed model + at least one co-financing/MoU path identified." Items marked 👤 are business-development / non-engineering.*

**Costed model**
- [ ] Replace every illustrative figure in §2 with **real quotes**: WhatsApp Cloud API Morocco conversation rates (by category), OpenAI Whisper + `gpt-4o-mini` actuals from production logs, MiniMax fallback pricing, ElevenLabs (if/when voice replies ship), Supabase tier, Twilio (or local aggregator) SMS rates.
- [ ] Instrument **per-mother cost telemetry** (messages, audio minutes, tokens, channel) so cost-per-mother is *measured*, not estimated.
- [ ] Add the **helpdesk/clinical labor line `L`** (Plan 1.2 nurse time per mother) to the model — the missing dominant cost.
- [ ] Model the **Plan 5.4 crossover**: cohort size `N` at which in-country fixed-cost hosting beats per-token APIs.
- [ ] Produce the **break-even workbook** (§5) with `c`, `L`, `F`, `p`, `N` as live inputs and channel-mix + model-cost sensitivities.

**Co-financing / MoU path**
- [ ] 👤 Confirm the **MoH / AMO budget line and procurement route** for per-mother digital-health co-financing in Morocco (national program vs. regional/provincial pilot).
- [ ] 👤 Identify and qualify **one anchor public partner** (a region/province directorate or national maternal-health program) for a pilot.
- [ ] 👤 Identify **one B2B2C path** (private clinic group or insurer) to fund early reference deployments and Plan 5.1 evidence.
- [ ] 👤 Map a **grant bridge**: 1–2 named funders to cover the validation study (5.1) and CNDP/residency work (1.3), each with a stated transition to recurring co-financing.
- [ ] 👤 Draft a **per-mother pricing proposal** benchmarked against the Jacaranda ~$0.74 reference and our costed model.
- [ ] 👤 Negotiate and sign **at least one MoU / letter of intent** with a public or B2B2C partner (satisfies Plan 5.3 acceptance).
- [ ] Confirm preconditions are credibly in train before approaching the MoH: **Plan 4.2 reporting** (WHO-DAK indicators + region dashboards + export), **Plan 5.1 evidence** (pilot safety read-out), **Plan 1.3 compliance** (CNDP / Law 09-08 / data residency).

---

*Cross-cutting guardrails still apply: keep CI green, update `schema.sql` with any data change, capture consent before processing/sharing, and never let the LLM downgrade rule-based triage urgency.*
