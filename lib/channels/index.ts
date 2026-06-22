// Plan 2.2 / E2.4 — channel-agnostic messaging abstraction, production-ready.
//
// Patients can be reached over multiple channels. WhatsApp is the default
// (and currently the only fully wired one). SMS is a Twilio-backed fallback for
// non-smartphone patients, and degrades gracefully when Twilio is not
// configured. USSD and voice are reserved for future work and are stubbed.
//
// The goal is that callers (webhook, cron jobs, server actions) send text via
// `sendText`/`sendToPatient` without caring which transport is used, and the
// patient's `preferred_channel` + consent (Plan 1.3) decide the rest.
//
// E2.4 hardening:
//   - Delivery logging: every send attempt with a known `patientId` is
//     best-effort logged to `message_deliveries` (never throws into the send
//     path).
//   - Retry with exponential backoff for transient failures (network errors,
//     HTTP 5xx, HTTP 429) on the WhatsApp and SMS HTTP calls. 4xx (other than
//     429) are not retried.
//
// Dependency-free: relies only on the global `fetch`, `Buffer`, and
// `URLSearchParams`.

import { createAdminClient } from "@/utils/supabase/admin";

export type Channel = "whatsapp" | "sms" | "ussd" | "voice";

export type DeliveryStatus = "sent" | "failed" | "skipped";

export interface SendResult {
  success: boolean;
  channel: Channel;
  skipped?: boolean;
  error?: string;
  attempts?: number;
}

const MAX_ATTEMPTS = 3;
// Backoff applied *between* attempts: after attempt 1 wait 500ms, after
// attempt 2 wait 1000ms. (No wait after the final attempt.)
const BACKOFF_MS = [500, 1000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decide whether an HTTP status code is worth retrying. Transient: 5xx and
 * 429 (rate limit). Everything else (other 4xx) is a permanent failure.
 */
function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

/**
 * Best-effort delivery logging. Never throws — any failure is swallowed so the
 * send path is unaffected. A no-op when `patientId` is absent.
 */
async function logDelivery(opts: {
  patientId?: string;
  channel: Channel;
  status: DeliveryStatus;
  attempts: number;
  error?: string;
}): Promise<void> {
  if (!opts.patientId) return;

  try {
    const supabase = await createAdminClient();
    await supabase.from("message_deliveries").insert({
      patient_id: opts.patientId,
      channel: opts.channel,
      status: opts.status,
      attempts: opts.attempts,
      error: opts.error ?? null,
    });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[channels] delivery logging failed", error);
  }
}

/**
 * Send a plain-text message over a specific channel (defaults to WhatsApp).
 * Never throws for missing configuration — it degrades gracefully and reports
 * the outcome via the returned `SendResult`. When `patientId` is provided, the
 * outcome is best-effort logged to `message_deliveries`.
 */
export async function sendText(params: {
  to: string;
  body: string;
  channel?: Channel;
  patientId?: string;
}): Promise<SendResult> {
  const channel: Channel = params.channel ?? "whatsapp";

  switch (channel) {
    case "whatsapp":
      return sendWhatsApp(params.to, params.body, params.patientId);
    case "sms":
      return sendSms(params.to, params.body, params.patientId);
    case "ussd":
    case "voice": {
      console.warn(`[channels] channel "${channel}" not implemented yet`);
      const result: SendResult = {
        success: false,
        channel,
        skipped: true,
        error: "channel not implemented",
        attempts: 0,
      };
      await logDelivery({
        patientId: params.patientId,
        channel,
        status: "skipped",
        attempts: 0,
        error: result.error,
      });
      return result;
    }
    default: {
      // Exhaustiveness guard for the Channel union.
      const _exhaustive: never = channel;
      return { success: false, channel: _exhaustive, error: "unknown channel" };
    }
  }
}

async function sendWhatsApp(to: string, body: string, patientId?: string): Promise<SendResult> {
  const channel: Channel = "whatsapp";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneId || !token) {
    const error = "WhatsApp not configured";
    await logDelivery({ patientId, channel, status: "skipped", attempts: 0, error });
    return { success: false, channel, skipped: true, error, attempts: 0 };
  }

  const recipient = to.replace(/\D/g, "");

  let attempts = 0;
  let lastError = "";

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { body },
        }),
      });

      if (res.ok) {
        await logDelivery({ patientId, channel, status: "sent", attempts });
        return { success: true, channel, attempts };
      }

      const detail = await res.text().catch(() => "");
      lastError = `WhatsApp send failed (${res.status})${detail ? `: ${detail}` : ""}`;
      console.error("[channels]", lastError);

      if (!isRetryableStatus(res.status) || attempts >= MAX_ATTEMPTS) {
        break;
      }
    } catch (e) {
      // Network/transport error — treated as transient and retryable.
      lastError = e instanceof Error ? e.message : String(e);
      console.error("[channels] WhatsApp send error", lastError);
      if (attempts >= MAX_ATTEMPTS) break;
    }

    await sleep(BACKOFF_MS[attempts - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1]);
  }

  await logDelivery({ patientId, channel, status: "failed", attempts, error: lastError });
  return { success: false, channel, error: lastError, attempts };
}

async function sendSms(to: string, body: string, patientId?: string): Promise<SendResult> {
  const channel: Channel = "sms";
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) {
    const error = "SMS not configured";
    await logDelivery({ patientId, channel, status: "skipped", attempts: 0, error });
    return { success: false, channel, skipped: true, error, attempts: 0 };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const form = new URLSearchParams({ To: to, From: from, Body: body });

  let attempts = 0;
  let lastError = "";

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      if (res.ok) {
        await logDelivery({ patientId, channel, status: "sent", attempts });
        return { success: true, channel, attempts };
      }

      const detail = await res.text().catch(() => "");
      lastError = `SMS send failed (${res.status})${detail ? `: ${detail}` : ""}`;
      console.error("[channels]", lastError);

      if (!isRetryableStatus(res.status) || attempts >= MAX_ATTEMPTS) {
        break;
      }
    } catch (e) {
      // Network/transport error — treated as transient and retryable.
      lastError = e instanceof Error ? e.message : String(e);
      console.error("[channels] SMS send error", lastError);
      if (attempts >= MAX_ATTEMPTS) break;
    }

    await sleep(BACKOFF_MS[attempts - 1] ?? BACKOFF_MS[BACKOFF_MS.length - 1]);
  }

  await logDelivery({ patientId, channel, status: "failed", attempts, error: lastError });
  return { success: false, channel, error: lastError, attempts };
}

/**
 * Send to a patient honoring their preferred channel and consent (Plan 1.3).
 * `undefined` consent is treated as allowed for back-compat with un-migrated
 * rows; only an explicit `false` blocks the send. When the patient carries an
 * `id`, the send outcome is best-effort logged to `message_deliveries`.
 */
export async function sendToPatient(
  patient: {
    id?: string;
    phone_number: string;
    preferred_channel?: Channel | null;
    consent_given?: boolean;
  },
  body: string,
): Promise<SendResult> {
  const channel: Channel = patient.preferred_channel ?? "whatsapp";

  if (patient.consent_given === false) {
    const error = "no consent";
    await logDelivery({ patientId: patient.id, channel, status: "skipped", attempts: 0, error });
    return { success: false, channel, skipped: true, error, attempts: 0 };
  }

  return sendText({ to: patient.phone_number, body, channel, patientId: patient.id });
}
