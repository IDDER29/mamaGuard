# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server (Next.js, http://localhost:3000)
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint (flat config in eslint.config.mjs)
npx tsc --noEmit # Type-check only
```

There is **no test framework** configured in this project. Do not assume a test runner exists.
The build, lint, and type-check are all green and enforced in CI (`.github/workflows/ci.yml`)
on every PR — keep them passing.

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
- Runs `lib/triage.ts` `assessTriage()` — a **validated, deterministic, conservative** danger-sign engine grounded in the WHO Antenatal Care DAK (multilingual Darija/French/English, negation-aware, versioned via `TRIAGE_VERSION`, with pre-eclampsia co-occurrence escalation). It returns the highest urgency + matched signs; this drives `patients.risk_level` and inserts an `alerts` row for `high`/`critical`. `lib/symptoms.ts` is now a thin back-compat re-export. Vignette tests: `node --experimental-strip-types --test lib/triage.vignettes.mjs`. The LLM reply layer must **never** downgrade this rule-based urgency.
- Saves the patient message (`role: "user"`), fetches the last 5 messages for context, then calls `lib/generateMamaResponse.ts`.
- Sends the AI reply back over WhatsApp and saves it (`role: "assistant"`).

`lib/generateMamaResponse.ts` is the LLM abstraction: it prefers **OpenAI** (`OPENAI_API_KEY`, model from `OPENAI_MODEL`) and falls back to **MiniMax** (`MINIMAX_API_KEY`) if no OpenAI key. The system prompt (`MAMA_SYSTEM_BASE`) defines the warm Darija "Mama AI" persona; patient context (name, gestational week, risk, doctor notes, chat history) is injected into the system prompt. On empty/failed completions it returns `FALLBACK_DARIJA`.

`lib/speak.ts` (ElevenLabs TTS, `eleven_multilingual_v2`) exists but voice replies are **not yet wired into the webhook** — only text is sent back.

`app/api/cron/check-in/route.ts` is a Vercel Cron job (schedule in `vercel.json`) that proactively messages every patient. It is **gated by `Authorization: Bearer ${CRON_SECRET}`** and reads `medical_history.notes` for context.

`app/api/whatsapp/send/route.ts` is a manual send endpoint.

### Data layer & a key snake_case convention

- Supabase clients: `utils/supabase/server.ts` (server components / route handlers, cookie-based), `utils/supabase/client.ts` (browser), and `utils/supabase/admin.ts` (**service-role**, for sessionless trusted server writes — webhook, cron, server actions; bypasses RLS, falls back to the anon server client when `SUPABASE_SERVICE_ROLE_KEY` is unset). Always pick the right one for the context; never import `admin.ts` into client code.
- The DB is **snake_case**; the app's `Patient` type (`types/index.ts`) is also snake_case but Supabase rows come back as loosely-typed records. **Always run rows through `normalizePatient()` in `lib/patients.ts`** before using them in the UI — it coerces types and supplies defaults. `mapPatientToManagementCard()` converts a `Patient` into the dashboard card shape (derives status, overdue, gestational progress %).
- Write path for new patients: the **server action** `app/actions/patients.ts` `registerPatient()` (`"use server"`). It maps the rich onboarding form to DB columns, then sends a Darija welcome message over WhatsApp.

### schema.sql is the source of truth (kept in sync)

`schema.sql` now matches the code: all `patients` columns the app reads/writes, an `updated_at` trigger, indexes, and **Row Level Security** policies (authenticated clinicians get full access; server writes use the service role to bypass RLS; anon gets nothing unless you opt into the commented demo policies). If you change patient fields, update the action/types **and** `schema.sql` together.

### Dashboard data: triage board + patient management both use real data

- `app/dashboard/page.tsx` (the triage board) uses **real Supabase data** via `usePatientData()`, mapping patients to a local `TriageCard` shape (`risk_level` critical→critical, high→warning). `lib/mockData.ts` is now only used for the sidebar/header `mockDoctor`/`mockStats` placeholders.
- `app/dashboard/patients/page.tsx` (patient management) uses **real Supabase data** via `usePatientData()` (`app/dashboard/patients/hooks/`), including a `postgres_changes` **realtime subscription** that silently re-fetches on any `patients` table change.
- `app/dashboard/patients/[id]/page.tsx` is a **server component** that loads the patient + conversation + messages from Supabase and passes them to a client component.

There are also several `lib/mock*.ts` files (`mockData`, `mockPatientData`, `mockPatientManagement`) used by various views. When wiring a view to real data, check whether it's still importing a mock module.

### Routing & middleware

- `proxy.ts` at the repo root is the **Next.js 16 middleware** (Next 16 renamed `middleware.ts` → `proxy.ts`). It refreshes the Supabase session on every non-API request and **gates `/dashboard` behind auth** (redirects to `/login` when signed out) — **unless `DISABLE_AUTH=true`**, which keeps the demo open. Secure by default; set `DISABLE_AUTH=true` in the env for hackathon/demo mode.
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

Required env vars (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server writes / RLS bypass), `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `VERIFY_TOKEN` (webhook handshake), `OPENAI_API_KEY` / `OPENAI_MODEL` (or `MINIMAX_API_KEY`), `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`, `CRON_SECRET` (cron auth), and `DISABLE_AUTH` (set `true` for open demo).

**Security note:** `.env` is now **git-ignored**; copy `.env.example` and fill it in locally. The keys previously committed to git history must be considered compromised — **rotate them**. Never add real secrets to tracked files.

`next.config.ts` whitelists remote image hosts (`lh3.googleusercontent.com`, `api.dicebear.com` — used for generated patient avatars, `images.unsplash.com`).
