# MamaGuard — Remediation Plan

A phased plan to fix the issues identified in the UI/UX + codebase review.
Phases are ordered by severity and dependency: do them top to bottom. Each task
lists the **files**, an **acceptance check**, **effort**, **risk**, and **owner**
(👤 = requires a human; 🤖 = Claude can do it).

Legend — Effort: S (<30m), M (~1–2h), L (half day+). Risk: how likely it breaks something.

---

## Phase 0 — Stop the bleeding (do first)

Critical: secrets exposure and a build that cannot ship.

### 0.1 Rotate and un-track secrets 👤 + 🤖
- **Problem:** `.env` is committed with live OpenAI / WhatsApp / MiniMax / Supabase keys and is not git-ignored.
- **Steps:**
  1. 👤 Rotate every key in the providers' dashboards (they must be considered compromised).
  2. 🤖 Add `.env` (and `.env*`) to `.gitignore`; `git rm --cached .env`.
  3. 🤖 Add a committed `.env.example` with empty placeholders.
  4. 👤 Decide whether to scrub git history (`git filter-repo`/BFG) — keys are still in old commits even after removal.
- **Files:** `.gitignore`, `.env` (untrack), new `.env.example`.
- **Acceptance:** `git ls-files | grep .env` returns only `.env.example`; app still runs with keys supplied via the environment.
- **Effort:** S · **Risk:** Low (rotation must precede deploy).

### 0.2 Make the production build green 🤖
- **Problem:** `next build` fails on pre-existing TypeScript errors.
- **Tasks:**
  - `components/dashboard/OnboardingForm.tsx` — fix import `@/components/ui/Card` → `@/components/ui/card`; replace `sonner` toast with the project's `hooks/use-toast` (or install `sonner` if preferred); fix the `zod`/resolver generic mismatch.
  - `components/dashboard/CommandPalette.tsx` — `riskLevel` → `risk_level`, remove/replace the missing `patientId` field on `DashboardPatient`.
  - `app/dashboard/patients/new/page.tsx` — fix the `setState`/`RegistrationStep` type error.
- **Acceptance:** `npx tsc --noEmit` is clean; `npm run build` succeeds.
- **Effort:** M · **Risk:** Med (touches a live onboarding form — verify it still submits).

---

## Phase 1 — Functional bug fixes (quick, high-value)

### 1.1 Fix broken nav anchors 🤖
- **Problem:** nav links to `#features` (no such id; section is `#solution`) and hero "Watch Demo" → `#video-demo` (doesn't exist).
- **Fix:** point links at real ids (`#problem`, `#solution`, `#how-it-works`, `#testimonials`, `#cta`) or add the missing section ids; remove/redirect the dead "Watch Demo" target.
- **Files:** `components/common/Navigation.tsx`, `components/sections/HeroSection.tsx` (and section ids if added).
- **Acceptance:** every nav/CTA link scrolls to a real section.
- **Effort:** S · **Risk:** Low.

### 1.2 Fix cron column bug 🤖
- **Problem:** `check-in/route.ts` reads `patient.medical_notes` (nonexistent) → prompts say "based on her notes (undefined)".
- **Fix:** use `patient.medical_history?.notes`; guard for null.
- **Files:** `app/api/cron/check-in/route.ts`.
- **Acceptance:** check-in prompt contains real notes or a clean fallback.
- **Effort:** S · **Risk:** Low.

### 1.3 Fix invalid default model 🤖
- **Problem:** fallback `"gpt-4o-min"` is a typo (invalid model).
- **Fix:** `"gpt-4o-mini"`.
- **Files:** `lib/generateMamaResponse.ts`.
- **Acceptance:** unset `OPENAI_MODEL` still returns a valid completion.
- **Effort:** S · **Risk:** Low.

### 1.4 (Optional) Wire voice replies 🤖
- **Problem:** `lib/speak.ts` (ElevenLabs TTS) is imported but unused; only text is sent despite "voice-first" branding.
- **Fix:** generate audio, upload to WhatsApp media, send an audio message; save `audio_url` on the message row.
- **Files:** `app/api/webhook/route.ts`, `lib/speak.ts`.
- **Acceptance:** a patient receives a voice note reply; `messages.audio_url` populated.
- **Effort:** L · **Risk:** Med (external media upload, cost) — defer if not demoing voice.

---

## Phase 2 — Security hardening

### 2.1 Verify / enable Supabase RLS 👤 + 🤖
- **Problem:** browser uses the anon key with realtime; if RLS is off, all patient data is readable by anyone.
- **Steps:** 👤 confirm RLS policies exist on `patients`/`conversations`/`messages`/`alerts`; 🤖 add policy SQL to `schema.sql` to document them.
- **Acceptance:** unauthenticated anon reads are denied by policy (or a documented, deliberate exception).
- **Effort:** M · **Risk:** High if currently open.

### 2.2 Re-enable the auth gate 🤖
- **Problem:** `/dashboard` redirect is commented out in `proxy.ts`; `/login`,`/register` aren't enforced.
- **Fix:** restore the redirect behind an env flag (e.g. `DISABLE_AUTH` for demos) so it can stay open for hackathon but ship secure.
- **Files:** `proxy.ts`, `app/login/page.tsx`, `app/register/page.tsx`.
- **Acceptance:** with the flag off, unauthenticated `/dashboard` → `/login`.
- **Effort:** M · **Risk:** Med (don't lock out the demo).

---

## Phase 3 — Data integrity

### 3.1 Sync `schema.sql` with the code 🤖
- **Problem:** `schema.sql` is missing ~20 `patients` columns the app reads/writes.
- **Fix:** add all referenced columns (`full_name`, `date_of_birth`, `national_id`, `trimester`, `blood_type`, `previous_pregnancies`, `current_medications`, `allergies`, `emergency_contact_*`, `spouse_partner_*`, `preferred_checkup_time`, `voice_reporting_frequency`, `has_smartphone`, `location_address`, etc.) plus RLS from 2.1.
- **Acceptance:** a fresh DB from `schema.sql` runs `registerPatient()` without "column does not exist".
- **Effort:** M · **Risk:** Low (doc/DDL only).

### 3.2 Make the triage board use real data 🤖
- **Problem:** `/dashboard` (the landing board) is 100% `lib/mockData.ts`; only `/dashboard/patients` is live.
- **Fix:** reuse `usePatientData()` + `mapPatientToManagementCard()`; keep mock as fallback when empty.
- **Files:** `app/dashboard/page.tsx`.
- **Acceptance:** the board reflects real Supabase patients in realtime.
- **Effort:** L · **Risk:** Med (largest page in the app).

---

## Phase 4 — UI/UX polish

### 4.1 Audit inner-page mobile responsiveness 🤖
- Patient tables, patient-detail view, multi-step "new patient" form.
- **Files:** `app/dashboard/patients/**`, `components/patient/**`, `components/patient-management/**`.
- **Acceptance:** no horizontal scroll / clipped controls at 375px width.
- **Effort:** M · **Risk:** Low.

### 4.2 Consolidate icon systems 🤖
- **Problem:** Material Icons + Material Symbols + lucide (134 usages / 32 files).
- **Fix:** standardize on lucide; drop the Material `<link>`s from `app/layout.tsx`.
- **Acceptance:** one icon library; no Material font requests.
- **Effort:** L · **Risk:** Med (broad, visual).

### 4.3 Remove duplicate dashboard header 🤖
- **Problem:** layout `DashboardHeader` + the triage page's own header overlap.
- **Fix:** keep one; move page-specific actions into `PageHeader`.
- **Files:** `app/dashboard/page.tsx`, `components/dashboard/DashboardHeader.tsx`.
- **Effort:** M · **Risk:** Med.

### 4.4 (Optional) Real dashboard dark mode 🤖
- Currently pinned to light. Only do this if dark clinical UI is actually wanted; requires tokenizing hardcoded `bg-white`/`text-slate-*`.
- **Effort:** L · **Risk:** Med. Defer unless requested.

---

## Phase 5 — Internationalization / RTL

### 5.1 RTL + Arabic layout 🤖 + 👤
- **Problem:** Darija/Arabic is the core audience but the UI is LTR (`rtl: false`); Arabic message bubbles render awkwardly.
- **Fix:** add `dir="rtl"` handling for Arabic content (at minimum chat bubbles / patient messages), set `components.json` `rtl` appropriately, mirror spacing utilities.
- **Acceptance:** Arabic text reads right-to-left in the conversation view.
- **Effort:** L · **Risk:** Med.

---

## Phase 6 — Process & docs

### 6.1 Add CI 🤖
- GitHub Action running `npm ci && npm run lint && npm run build` on PRs so the build can't silently go red again.
- **Effort:** S · **Risk:** Low.

### 6.2 Update `CLAUDE.md` 🤖
- Note build status, the auth flag, RLS expectations, and the real-vs-mock data state once Phase 3 lands.
- **Effort:** S · **Risk:** Low.

---

## Suggested execution order (fast path)

1. **Phase 0** (secrets + green build) — unblocks everything.
2. **Phase 1.1–1.3** (three quick bug fixes) — one small PR.
3. **Phase 2** (RLS + auth) — before any real deploy.
4. **Phase 3.1** (schema) then **3.2** (real triage board).
5. **Phase 4** polish, **Phase 5** RTL, **Phase 6** process — iterative.

👤 **Owner-only items:** rotating keys (0.1), confirming RLS in the Supabase console (2.1),
and deciding on git-history scrubbing (0.1.4). Everything else 🤖 can implement.
