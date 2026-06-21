# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server (Next.js, http://localhost:3000)
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint (flat config in eslint.config.mjs)
```

There is **no test framework** configured in this project. Do not assume a test runner exists.

## What this is

MamaGuard ("Mama AI") is a maternal-health monitoring system for Morocco. It has two distinct halves living in one Next.js 16 (App Router, React 19) codebase:

1. **A WhatsApp + AI conversational agent** that talks to pregnant patients in Moroccan Darija, detects risky symptoms, and escalates.
2. **A clinician-facing web dashboard** for triage and patient management.

The persistence and realtime layer for both is **Supabase** (Postgres + Realtime).

## Architecture

### The WhatsApp / AI pipeline (the backend core)

This is the part that requires reading multiple files to understand. The flow when a patient sends a WhatsApp message:

`app/api/webhook/route.ts` (Meta WhatsApp Cloud API webhook) →
- `POST` responds **200 immediately**, then runs `processMessageInBackground` (fire-and-forget) so Meta doesn't time out.
- If the message is audio, it downloads the media via the Graph API and transcribes it with `lib/transcribe.ts` (OpenAI Whisper, forced `language: 'ar'`).
- Deduplicates by `metadata->>wamid`, then finds-or-creates the `patients` row (by `phone_number`) and its `conversations` row.
- Runs `lib/symptoms.ts` `analyzeSymptomRisk()` — a **keyword/substring matcher** (Darija + English) over a hardcoded `SYMPTOMS_DATABASE`, returning the highest-urgency match. This drives `patients.risk_level` and inserts an `alerts` row for `high`/`critical`.
- Saves the patient message (`role: "user"`), fetches the last 5 messages for context, then calls `lib/generateMamaResponse.ts`.
- Sends the AI reply back over WhatsApp and saves it (`role: "assistant"`).

`lib/generateMamaResponse.ts` is the LLM abstraction: it prefers **OpenAI** (`OPENAI_API_KEY`, model from `OPENAI_MODEL`) and falls back to **MiniMax** (`MINIMAX_API_KEY`) if no OpenAI key. The system prompt (`MAMA_SYSTEM_BASE`) defines the warm Darija "Mama AI" persona; patient context (name, gestational week, risk, doctor notes, chat history) is injected into the system prompt. On empty/failed completions it returns `FALLBACK_DARIJA`.

`lib/speak.ts` (ElevenLabs TTS, `eleven_multilingual_v2`) exists but voice replies are **not yet wired into the webhook** — only text is sent back.

`app/api/cron/check-in/route.ts` is a Vercel Cron job (schedule in `vercel.json`) that proactively messages every patient. It is **gated by `Authorization: Bearer ${CRON_SECRET}`**. Note: it reads `patient.medical_notes`, a column that does not exist in the current schema (`medical_history` is the real column) — treat cron code as partially stale.

`app/api/whatsapp/send/route.ts` is a manual send endpoint.

### Data layer & a key snake_case convention

- Supabase clients: `utils/supabase/server.ts` (server components / route handlers / server actions, cookie-based) and `utils/supabase/client.ts` (browser). Always pick the right one for the context.
- The DB is **snake_case**; the app's `Patient` type (`types/index.ts`) is also snake_case but Supabase rows come back as loosely-typed records. **Always run rows through `normalizePatient()` in `lib/patients.ts`** before using them in the UI — it coerces types and supplies defaults. `mapPatientToManagementCard()` converts a `Patient` into the dashboard card shape (derives status, overdue, gestational progress %).
- Write path for new patients: the **server action** `app/actions/patients.ts` `registerPatient()` (`"use server"`). It maps the rich onboarding form to DB columns, then sends a Darija welcome message over WhatsApp.

### ⚠️ schema.sql is incomplete vs. the code

`schema.sql` defines only the minimal tables (`patients`, `conversations`, `messages`, `alerts`). But `app/actions/patients.ts` and `types/index.ts` reference **many additional `patients` columns** (`full_name`, `date_of_birth`, `national_id`, `trimester`, `blood_type`, `previous_pregnancies`, `current_medications`, `allergies`, `emergency_contact_*`, `spouse_partner_*`, `preferred_checkup_time`, `voice_reporting_frequency`, `has_smartphone`, `location_address`, etc.). The live Supabase instance has these columns; `schema.sql` has not been kept in sync. If you change patient fields, update both the action/types AND `schema.sql`.

### ⚠️ Dashboard uses mock data; Patient Management uses real data

This is an easy trap:
- `app/dashboard/page.tsx` (the triage board) is a **client component built entirely on `lib/mockData.ts`** — it does not touch Supabase.
- `app/dashboard/patients/page.tsx` (patient management) uses **real Supabase data** via `usePatientData()` (`app/dashboard/patients/hooks/`), including a `postgres_changes` **realtime subscription** that silently re-fetches on any `patients` table change.
- `app/dashboard/patients/[id]/page.tsx` is a **server component** that loads the patient + conversation + messages from Supabase and passes them to a client component.

There are also several `lib/mock*.ts` files (`mockData`, `mockPatientData`, `mockPatientManagement`) used by various views. When wiring a view to real data, check whether it's still importing a mock module.

### Routing & middleware

- `proxy.ts` at the repo root is the **Next.js 16 middleware** (Next 16 renamed `middleware.ts` → `proxy.ts`). It refreshes the Supabase session on every non-API request. The `/dashboard` auth-redirect is **deliberately commented out** ("FOR THE HACKATHON DEMO") — there is currently no real auth gate; `/login` and `/register` pages exist but aren't enforced.
- Route groups: `app/(marketing)/` is the public landing page (composed of `components/sections/*`). `app/dashboard/` is the clinical app with its own `layout.tsx` (sidebar shell).

### Component organization

- `components/ui/` — shadcn/ui primitives ("new-york" style, see `components.json`; alias `@/components/ui`, icons from `lucide-react`). Add new primitives with `npx shadcn@latest add <name>`.
- `components/sections/` — landing page sections. `components/common/` — Navigation/Footer.
- `components/dashboard/`, `components/patient/`, `components/patient-management/` — dashboard feature components, each with a barrel `index.ts`.
- Feature-local code is co-located under the route: `app/dashboard/patients/{components,hooks}/` hold page-specific pieces (see `app/dashboard/patients/ARCHITECTURE.md`).
- Toasts: `hooks/use-toast.ts` + `components/ui/toaster.tsx`.

## Conventions

- **Path alias:** `@/*` maps to the repo root (`tsconfig.json`). Import as `@/lib/...`, `@/components/...`, `@/utils/...`.
- TypeScript `strict` is on. Tailwind CSS v4 (config lives in `app/globals.css` via `@theme`, not a JS config file). `cn()` helper in `lib/utils.ts`.
- Forms use `react-hook-form` + `zod` (`@hookform/resolvers`); charts use `recharts`.
- The patient-facing assistant must respond in **Darija (Moroccan Arabic)**, often Latin-script transliteration. When editing prompts/messages in `generateMamaResponse.ts`, `app/actions/patients.ts`, or `symptoms.ts`, preserve the Darija content and tone.

## Environment & secrets

Required env vars (see `.env`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `VERIFY_TOKEN` (webhook handshake), `OPENAI_API_KEY` / `OPENAI_MODEL` (or `MINIMAX_API_KEY`), `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`, and `CRON_SECRET` (cron auth).

**Security note:** `.env` is currently committed to the repo with live API keys and is **not** in `.gitignore`. Do not add further secrets to tracked files; if asked to handle secrets, flag that these committed keys should be rotated and `.env` git-ignored.

`next.config.ts` whitelists remote image hosts (`lh3.googleusercontent.com`, `api.dicebear.com` — used for generated patient avatars, `images.unsplash.com`).
