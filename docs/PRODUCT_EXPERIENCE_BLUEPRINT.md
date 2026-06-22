# MamaGuard — Product Experience Blueprint

*Senior product-strategy + UX-architecture definition. Written against the platform as it exists today (WhatsApp/Darija AI agent + Supabase + clinician dashboard) and what it must become. Companion docs: `INFORMATION_ARCHITECTURE.md`, `CONVERSATION_DESIGN.md`, `EXPERIENCE_ROADMAP.md`.*

---

## ⚠️ The framing everything depends on

MamaGuard is **not one frontend — it is two products sharing one brain.**

| Surface | User | "Interface" | Constraints |
|---|---|---|---|
| **Conversation** | Pregnant/postpartum mother | **WhatsApp** (text + voice), SMS fallback | Low literacy, Darija (no standard spelling), low bandwidth, feature phones, high anxiety, zero tolerance for being dismissed |
| **Dashboard** | Clinician / nurse / CHW / program manager | **Next.js web app** | Time-poor, high-stakes, alert-fatigue risk, often on a phone in a clinic, needs speed + auditability |

These have **opposite** design constraints (minimalism + warmth vs. density + control). The dashboard is downstream of the conversation. Designing the dashboard without designing the conversation is the #1 risk.

---

## 1. Product Vision

**What it does:** A pregnant/postpartum woman chats — in Moroccan Darija, by text or voice — with a warm AI assistant over WhatsApp. A deterministic, WHO-grounded triage engine screens every message for danger signs, escalates risky cases to a clinician within an SLA, and the clinician manages and responds through a web dashboard. Around the core: reminders, education, postpartum/newborn care, mental-health screening, vitals, referrals.

**Who it's for:** Primary — rural, lower-income, lower-literacy Moroccan mothers on WhatsApp. Secondary — the clinicians/nurses/CHWs who triage them. Buyer — Ministry of Health / clinics / NGOs (B2G/B2B); the mother never pays.

**Core value proposition:**
- *Mothers:* "Someone who speaks my language is always listening, will tell me honestly when something is dangerous, and gets me to care fast."
- *Clinicians:* "I see the few patients who actually need me, with the context to act in seconds, and a record that protects me."
- *System:* fewer preventable complications at low cost per mother, with reporting that justifies funding.

**What makes users stay:** mothers — warm, Darija, voice-first, free, reliable, and a real scare handled well. Clinicians — reduced noise, time saved, audit/SLA coverage.

**First 30 seconds:**
- *Mother:* "A real, kind helper in my language; not a doctor, but watches over me and gets me help; my info is private."
- *Clinician:* "The patients who need me now, sorted by urgency, with a clock; I can act without digging."

## 2. User Expectations

**Mother:** seconds-fast replies; no app/login/forms; never dismissed; honest about limits; works on weak signal; understands Darija + code-switching; remembers context; private; usable while illiterate (voice in/out) and on 2G/SMS.

**Clinician/CHW:** instant queue; one-click context; reply/refer without page-hopping; low false-negatives **and** tolerable false-positives; explainable flags (why flagged); realtime; never lose a critical; ownership/handoff; **phone-usable**; WCAG AA, large targets, **RTL/Arabic**, color-blind-safe urgency.

## 3. Platform Promises

| Promise | Expected outcome |
|---|---|
| Always listening, in Darija | Any message/voice, any hour → understood, answered |
| Honest about danger | Real danger signs → urgent unambiguous "go now," never softened |
| A clinician helps when serious | High/critical → human acts within SLA (≤15m critical / ≤60m high) |
| Privacy | No leaks; consent respected; no partner share without opt-in |
| Don't miss care | ANC + immunization reminders arrive and are actionable |
| *(clinician)* We surface who needs you | Conservative, deduped triage with context + audit |

**Breaks trust (catastrophic):** under-triage; LLM down-talking a rule urgency; unanswered critical; privacy leak / non-consented partner message; mistranscription → wrong advice.
**Disappoints (still churns):** "I didn't understand" loops; reminder spam; alert fatigue; broken-on-mobile dashboard.

## 4. Competitor-Level UX Analysis

(Grounded in `COMPETITIVE_ANALYSIS.md`: Jacaranda PROMPTS, MomConnect/SafeMom, Babyl, Khushi Baby, Wired Mothers, turn.io; consumer Flo/Ovia/Maven.)

**Conversation patterns expected:** quick-reply buttons / numbered menus for low literacy (gap — we're free-text only); typing indicators + fast turns; two-way voice notes (voice reply not yet wired); staged week-keyed nudges (have); explicit "not a diagnosis / call X" framing; STOP/HELP/lang keywords.

**Dashboard conventions assumed:** urgency-sorted work queue with SLA + ownership (have); patient record with timeline + vitals trends + notes; global search/command palette (have ⌘K); realtime; audit visibility; reply-from-record (have); **canned/template replies** (gap); export/reporting (have CSV/FHIR); **dashboard language toggle FR/AR** (gap).

**Modern patterns to honor:** optimistic UI w/ rollback, toasts on every mutation, skeleton loaders, actionable empty states, keyboard-first, mobile bottom-nav.

## 5. User Personas

- **P1 Khadija, 26, rural mother (beginner/non-technical, PRIMARY):** low literacy, Darija voice notes. Goals: healthy baby, reassurance, know when to worry, avoid needless travel. Pain: far clinic, can't read long text, weak signal. Flow: voice-note symptoms → warm Darija reply → on danger, "go now" + (consent) husband alerted.
- **P2 Nadia, 34, triage nurse (power user, PRIMARY dashboard):** high domain, medium tech. Goals: clear worklist safely/fast, never miss critical, defensible records. Pain: alert fatigue, context-switching, ambiguous flags, double-handling. Flow: queue → triage by SLA → patient → call/reply/refer → resolve+note. Keyboard-driven.
- **P3 Youssef, 41, CHW (non-technical, mobile-only, field):** basic smartphone, intermittent data. Goals: which of *my* mothers need a visit today; log BP; confirm referral. Pain: desktop-only tools, offline gaps, tiny targets. Flow: phone → "Mine" worklist → overdue + alerts → visit → vitals → assign/refer.
- **P4 Dr. Salma, 47, clinic lead / program manager (team/business):** medium tech. Goals: coverage, ANC adherence, outcomes, staffing to SLA, funder/MoH reports. Pain: no aggregate view, manual reporting. Flow: analytics → SLA/adherence/risk → export → assign CHWs → supervise.
- **P5 Omar, 32, integration engineer/analyst (technical):** high tech. Goals: push to national EHR, pull analytics, verify compliance. Pain: no standards = no integration, unclear residency. Flow: FHIR/CSV; reads COMPLIANCE.md; env/migrations.

## 6. Complete User Stories

**Onboarding:** mother starts by messaging (no app); greeted in Darija by name with what this is/isn't; clinic registers her (welcome + consent); mother gives/refuses consent explicitly.
**Auth:** clinician secure login gates `/dashboard`; session persists; admin demo mode without real-data exposure.
**Dashboard:** nurse sees urgency-sorted queue with SLA; one click to context; CHW filters "Mine."
**Main features:** mother reports symptoms by voice; nurse acknowledges→resolves with note; nurse replies over WhatsApp from the record; clinician records BP/EPDS/vitals with auto-escalation; clinician creates tracked referral.
**Search/filter:** ⌘K by name/phone; filter by risk/stage/region/channel.
**Notifications:** clinician notified (in-app/push/WhatsApp) on critical + SLA-near-breach; mother gets ANC/immunization reminders.
**Settings:** mother sets language + channel; clinician sets dashboard language + notification prefs.
**Collaboration:** see alert owner (no double-handling); supervisor reassigns; partner notified on critical *only with consent*.
**Error handling:** mother gets graceful re-ask on transcription failure **with conservative escalation on danger words**; clinician gets error toasts + retry.
**Mobile:** CHW uses full worklist + vitals one-handed.
**Account:** admin manages clinician accounts/roles; mother requests data deletion (erasure).
**Billing (org-level):** manager sees usage/cost-per-mother for B2G; *no individual patient billing.*
**AI:** mother — context memory + grounded answers; clinician — guarantee the AI can't lower a rule-based urgency.

## 7. Full Workflow Mapping

Format: Intent → UI action → System response → Feedback → Friction.

- **First-time mother:** curiosity → "salam"/voice → find/create patient + Darija welcome + disclaimer + consent → feels welcomed → *friction:* no quick replies, consent as free text. Fix: interactive menus.
- **Returning mother (symptom):** voice note → transcribe→triage→save→grounded reply; high/critical → alert + urgent guidance + (consent) partner → fast warm reply → *friction:* transcription error. Fix: confidence-gated clarify + conservative escalation.
- **Clinician (clear queue):** open alerts → scan Action-needed by SLA → patient → call/reply/refer → resolve+note → SLA badges, optimistic, toast, audit → *friction:* no off-screen notification, SLA not live. Fix: push/WhatsApp clinician alerts + live tick.
- **Failure/recovery:** weak signal/SMS → degrade to text, channel routes SMS → *friction:* USSD/voice stubs, SMS needs Twilio. Fix: finish providers, retry semantics. Clinician action fail → toast + retry; unhandled critical → auto-escalate/reassign on breach (not built).
- **Upgrade/payment (B2G):** manager pulls analytics + cost-per-mother → export → MoU offline → *friction:* cost dashboard not built. Fix: program KPI/cost view. No individual checkout.
- **Team collaboration:** acknowledge claims → colleague sees owner → handoff/reassign → referral tracked through statuses → *friction:* no owner identity/reassign UI. Fix: owner avatar, reassignment, supervisor view.

## 8. Frontend Architecture (Dashboard)

**Pages (✅ exists / ➕ add):** ✅ Triage Queue (SLA + review), ✅ Worklist (Mine/All), ✅ Patients list, ✅ Patient detail (clinical/appts/EPDS/vitals/postpartum/referrals/partner/trends/CHW assign), ✅ Education, ✅ Analytics; ➕ Settings, ➕ Admin (users/roles, facilities, audit viewer), ➕ Notifications center, ➕ polished auth.
**Navigation:** desktop left sidebar (primary+secondary) + **mobile bottom-tab bar** (Queue, Worklist, Patients, Search); ⌘K palette; breadcrumbs on detail.
**Information hierarchy:** urgency → identity → why-flagged → time/SLA → actions. Detail: header → left clinical rail → center conversation/summary.
**Components:** keep shadcn/ui + Tailwind v4 + lucide. Standardize `<UrgencyBadge>`, `<SLABadge>`, `<PatientHeader>`, `<DataCard>` (built-in loading/empty/error), `<ActionBar>`, `<Toast>`. Co-locate per route.
**State:** server actions (admin reads → work in demo+auth); Supabase realtime for queue; local state + `useMemo` (respect no-setState-in-effect lint); optimistic + rollback; `router.refresh()` post-mutation; avoid heavy global store.
**Responsive:** mobile-first Worklist + vitals; single-column reflow; sticky action bar; ≥44px targets; test low-end Android.
**Loading/empty/error:** skeletons; actionable empty states everywhere; per-card error + retry; global error boundary + offline banner; never a blank screen.
**Accessibility:** WCAG 2.1 AA; landmarks; modal focus-trap (EPDS modal lacks it — fix); urgency by icon+text not color-only; **RTL + Arabic locale**; full keyboard operability.

## 9. UX Details & Microinteractions

**Dashboard:** hover lift + tooltips on icon buttons; 150–200ms transitions (respect reduced-motion); new critical slides in + pulses; SLA pulses red on breach; optimistic + toast on every mutation; confirm/notes on Resolve, explicit modal on destructive/erasure; specific human messaging; shortcuts (⌘K, j/k, a=ack, r=resolve, ?=help); mobile pull-to-refresh, swipe quick-actions, bottom sheets.
**Conversation:** typing indicator; voice replies; quick-reply/numbered menus; emoji warmth; pinned "not a diagnosis"; gentle re-ask; STOP/HELP/lang keywords.

## 10. Trust & Retention

**Builds trust:** conservative accurate triage (no under-triage); honesty (AI, not diagnosis); a human appears on danger; consent + privacy; fast Darija/voice; reliability on weak nets; (clinician) explainable flags, audit, low false-positives, SLA reliability.
**Retention:** a real scare handled well (magic moment); useful nudges that arrive; context memory; CHW time saved; manager reports that secure funding.
**Delight:** caring Darija voice reply; personal proactive check-ins; consented partner loop; clinician keyboard-speed; "worklist clear ✓".
**Frustrates:** understanding loops; spam; alert fatigue; broken-on-phone; English-only UI; slow loads.
**Churn/harm:** under-triage; unanswered critical; privacy breach; non-consented partner message; mistranscription; downtime in emergency.
**Premium feel:** calm + certain under stress — fast, never loses a critical, every action acknowledged and auditable, mother always feels heard.

## 11. MVP vs Future

**MVP (safety core — mostly built):** deterministic WHO triage + never-downgrade + safety gate; WhatsApp text+voice intake, Darija replies, context, grounding; human-in-loop queue (SLA + review), ack/resolve, audit, reply-from-record; consent + privacy; ANC + immunization reminders; appointment confirm/reschedule; patient record (vitals/BP→alert, EPDS→alert, postpartum); auth + mobile-usable worklist; **clinician notification on critical/SLA-breach (not yet built — top MVP gap)**; **voice reply wired into webhook (built, not connected)**.
**Nice-to-have:** quick replies/menus; canned clinician templates; dashboard i18n (FR/AR + RTL); translated content; live SLA tick + auto-escalate/reassign; owner visibility; supervisor view; settings + notifications center; facilities admin; audit viewer; cost/KPI program dashboard.
**Advanced future:** teleconsultation (currently *promised in onboarding copy* — build or remove); connected BP cuff/wearables; predictive risk; offline-first CHW app; fine-tuned Darija model; two-way FHIR/national EHR.
**Do NOT include initially:** individual patient billing; patient web/app portal (WhatsApp is the interface); social community (misinformation risk); gamification/streaks (wrong tone); open chat without the triage guardrail.

## 12. Final Recommendations

**UX priorities:** (1) design the conversation as a first-class surface; (2) close the human-in-the-loop loop (clinician notifications + SLA escalation/reassignment); (3) mobile-first dashboard for CHWs; (4) explainability everywhere (why flagged, audited); (5) wire voice replies + confidence-gated transcription fallback.
**Frontend priorities:** standardize `<DataCard>` states; build Settings + Notifications + Admin; dashboard i18n + RTL; fix modal a11y; live SLA + owner/assignment visibility.
**Risks:** clinical safety/liability (under-triage); SLAs that aren't staffed (promises without notifications/escalation); connectivity/literacy reality (finish SMS/USSD + voice); compliance/data residency (CNDP unresolved); demo-vs-real RLS posture.
**Missing considerations to decide now:** dashboard language & RTL; clinician notification channel; the "video consultations" promise (build or remove); erasure/retention workflow; patient identity/duplicate handling across numbers.
**Critical before continuing frontend:** (1) conversation-design spec; (2) notification + SLA-escalation model; (3) design-system pass (tokens, urgency semantics, `<DataCard>` states, modal a11y, mobile nav, RTL/i18n); (4) one-page IA map (pages, nav, roles→access).
