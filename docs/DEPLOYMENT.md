# MamaGuard — Deployment Runbook

Operational guide for deploying MamaGuard to production for real mothers, clinicians, and facilities. Pairs with `PRODUCTION_READINESS.md` (status) and `COMPLIANCE.md` (data protection).

## 1. Provision infrastructure
- **Supabase project** in an approved region (see `COMPLIANCE.md` — confirm before processing patient data).
- **Hosting**: Vercel (or any Next.js 16 host). Crons in `vercel.json` require a host that runs scheduled functions; otherwise trigger the cron routes from an external scheduler (all are `CRON_SECRET`-gated).
- **Meta WhatsApp Cloud API** business number + app; **OpenAI** (or MiniMax) key.

## 2. Database
1. Run migrations **in order** `0000`→`0012` (`supabase/migrations/`, see its README). All additive + idempotent; safe to re-run.
2. Seed the first admin: insert one `clinician_profiles` row with your Supabase auth `user_id` and `role='admin'` (or, with `DISABLE_AUTH=true`, the app grants a synthetic admin for setup).
3. Verify RLS is enabled (it is in `schema.sql`); confirm `service_role` key is set so server actions work.

## 3. Environment
Set all required vars from `.env.example`. Production-critical:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `VERIFY_TOKEN`, **`WHATSAPP_APP_SECRET`** (enables webhook signature verification — do not skip in prod)
- `OPENAI_API_KEY` (+ `OPENAI_MODEL`) or `MINIMAX_API_KEY`
- `CRON_SECRET`
- **`DISABLE_AUTH=false`** (secure mode — `true` is demo-only and exposes the dashboard)
Optional integrations activate when supplied: `ELEVENLABS_*`, `TWILIO_*`, `INGEST_TOKEN`, `FHIR_TOKEN`, `MAMALLAMA_*`, `REPORT_WEBHOOK_URL`.

## 4. Connect the webhook
1. Set the Meta webhook callback to `https://<host>/api/webhook`, verify token = `VERIFY_TOKEN`.
2. Confirm `WHATSAPP_APP_SECRET` is set so `X-Hub-Signature-256` is verified (forged posts are rejected).
3. Subscribe to `messages` events.

## 5. Verify the deploy
- `GET /api/health` → `200 {"status":"ok","db":"ok"}` (uptime monitor target; `503` means DB unreachable).
- Send a WhatsApp message to the number → expect a Darija reply; a danger-sign message → an alert in `/dashboard/alerts`.
- Sign in to `/dashboard`; confirm role-scoped nav.

## 6. Operations
- **Crons** (`vercel.json`): check-in, reminders (+missed-visit + retention purge), sla-monitor (5 min), export (weekly). All `CRON_SECRET`-gated.
- **Monitoring**: poll `/api/health`; watch logs for `[Webhook]`, `[cron/*]`, `[Mama AI]` errors. Alert on `sla_breach` notifications.
- **Cost**: the analytics "Program & Outcomes" card shows metered cost (from `usage_events` + `message_deliveries`).
- **Backups**: enable Supabase point-in-time recovery; patient data is sensitive.
- **Secrets**: rotate anything that ever touched git history; store only in the host's secret manager.

## 7. Safety & compliance gates (do not bypass)
- CI runs lint + type-check + build + triage vignettes + **under-triage safety gate** + conversation + risk tests on every push. Keep them green.
- The deterministic triage engine (`lib/triage.ts`) owns urgency; the LLM can never lower it. Re-run `npm run test:safety` whenever triage rules change.
- Capture **consent** before processing (onboarding records it; STOP withdraws, START restores). Honor erasure requests (admin "Erase").
- Complete the CNDP / Law 09-08 steps in `COMPLIANCE.md` before going live with real patients.

## 8. Known scale follow-ups (fine for hundreds; address before thousands)
- Patient list & analytics read the full cohort; add server-side pagination/virtualization for very large cohorts.
- Webhook does fire-and-forget background processing; for high volume, move to a durable queue (the `wamid` dedup guards against double-processing, not loss).
- In-memory rate limiting isn't reliable on serverless — front public endpoints with a gateway/WAF.
- Per-row role RLS is enforced for admin tables; exercise role behavior in a Supabase staging project (uses `auth.uid()`).
