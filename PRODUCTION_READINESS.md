# MamaGuard — Production Readiness

*Status of the platform for production deployment. Every roadmap item's software is implemented and CI-verified; this doc states what's done, how to deploy, and the external pieces each integration still needs.*

## ✅ Verified gates (run in CI on every push)
- `npm run lint` — 0 errors
- `npx tsc --noEmit` — 0 errors
- `npm run build` — succeeds
- `npm run test:triage` — 20/20 WHO-ANC danger-sign vignettes
- `npm run test:safety` — **0% under-triage** on the labeled eval set (fails the build on any dangerous under-triage)
- `npm run test:conversation` — 18/18 intent-parser cases
- Migrations `0000`–`0009` validated on PostgreSQL 16: apply in order, **idempotent**, and the chain equals a fresh `schema.sql` (**162 columns**).

## Deploy checklist
1. **Run migrations** `0000`→`0009` in order (Supabase SQL editor / CLI / psql loop — see `supabase/migrations/README.md`).
2. **Set env vars** (`.env.example` is the source of truth):
   - Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `VERIFY_TOKEN`, `OPENAI_API_KEY` (or `MINIMAX_API_KEY`), `CRON_SECRET`.
   - Recommended: `ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID` (voice replies), `DISABLE_AUTH=false` (secure mode).
   - Optional integrations (each works once supplied): `TWILIO_*` (SMS), `INGEST_TOKEN` (device BP), `FHIR_TOKEN` (EHR write-back), `MAMALLAMA_*` (fine-tuned model), `REPORT_WEBHOOK_URL` (scheduled export).
3. **Seed an admin:** insert one `clinician_profiles` row with `role='admin'` and your auth `user_id` (or accept the first invite). In demo (`DISABLE_AUTH=true`) the app grants a synthetic admin.
4. **Crons** (configured in `vercel.json`): check-in, reminders (+missed-visit + retention purge), sla-monitor (every 5m), export (weekly). All gated by `CRON_SECRET`.
5. **Rotate** any secrets that ever touched git history.

## Cron jobs
| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/check-in` | per `vercel.json` | proactive week-grounded check-ins |
| `/api/cron/reminders` | daily 08:00 | ANC/immunization reminders + missed-visit flag + retention purge |
| `/api/cron/sla-monitor` | every 5 min | SLA warning/breach → escalate + notify |
| `/api/cron/export` | weekly Mon 06:00 | patient CSV → `REPORT_WEBHOOK_URL` |

## Integration seams — ready, pending an external resource
| Capability | Code | Needs |
|---|---|---|
| SMS / USSD reach | `lib/channels` (Twilio impl + retry + logging) | a Twilio (or aggregator) account; USSD/voice partner |
| Multilingual content | Darija/FR/AR in `lib/content.ts` | **clinician review** of machine-drafted FR/AR |
| Data residency (Law 09-08/CNDP) | consent model + erasure + retention in place | **legal sign-off + Supabase region** decision (`COMPLIANCE.md`) |
| Teleconsultation | `appointments.meeting_url` + scheduler + reminder link | a video provider (paste/generate the link) |
| Predictive risk | `lib/riskScore.ts` heuristic (advisory) | optionally an ML model later (heuristic is production-usable now) |
| Wearable / BP cuff | `POST /api/ingest/vitals` (token-gated) | a device/gateway that POSTs readings + `INGEST_TOKEN` |
| Fine-tuned Darija model | provider seam in `generateMamaResponse` | a hosted OpenAI-compatible model + `MAMALLAMA_*` |
| FHIR / national EHR | `POST /api/fhir/observation` + `GET /api/fhir/patient/[id]` | an EHR endpoint + `FHIR_TOKEN` |
| Offline CHW | PWA manifest + offline SW | full offline-sync is future (read/write queue) |

## Hardening status
- ✅ **Metered cost** — `usage_events` (migration 0010) + `lib/usage.ts` log LLM (token-based), STT, and TTS spend; `programMetrics` now computes real cost from `usage_events` (AI) + `message_deliveries` (channel sends), falling back to the illustrative estimate only when no metered data exists yet. The analytics card shows "metered" vs "illustrative".
- ✅ **Role-level RLS** — migration 0011 adds `current_clinician_role()` (security-definer) and restricts **writes** on `clinician_profiles` / `clinician_invites` to admins, while keeping reads for authenticated. Clinical tables remain authenticated-accessible (triage helpdesk needs cross-patient visibility; CHW scoping is enforced in the UI). Trusted server writes use the service-role client by design. *Validated locally with an `auth.uid()` stub; exercise role behavior in a Supabase staging project (auth.uid() is Supabase-provided).*
- ✅ **WCAG sweep** — skip-to-content link + `main` landmark, `role=status`/`aria-live` on the offline banner, dialog semantics + Esc + backdrop-close on modals, and `aria-label`s on icon-only buttons/inputs across the triage queue, worklist, and patient detail. (A full third-party audit is still recommended before formal compliance claims.)
- ✅ Legacy dead sidebar links removed (now → Notifications).
- ⬜ **Interactive WhatsApp buttons**: numbered-menu copy is specced; native button payloads can replace free-text where supported (non-blocking).

## Safety posture (non-negotiable, enforced)
Triage urgency is computed by the deterministic WHO-ANC engine (`lib/triage.ts`) and written independently of the LLM — **the LLM can never lower a rule-based urgency**. The under-triage safety gate (`npm run test:safety`) blocks any release that regresses emergency detection. Every clinical action and triage decision is written to `audit_log`; consent is captured before processing and is revocable (STOP).
