// Plan 2.2 — channel-agnostic messaging abstraction.
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
// Dependency-free: relies only on the global `fetch` and `Buffer`.

export type Channel = "whatsapp" | "sms" | "ussd" | "voice";

export interface SendResult {
  success: boolean;
  channel: Channel;
  skipped?: boolean;
  error?: string;
}

/**
 * Send a plain-text message over a specific channel (defaults to WhatsApp).
 * Never throws for missing configuration — it degrades gracefully and reports
 * the outcome via the returned `SendResult`.
 */
export async function sendText(params: {
  to: string;
  body: string;
  channel?: Channel;
}): Promise<SendResult> {
  const channel: Channel = params.channel ?? "whatsapp";

  switch (channel) {
    case "whatsapp":
      return sendWhatsApp(params.to, params.body);
    case "sms":
      return sendSms(params.to, params.body);
    case "ussd":
    case "voice":
      console.warn(`[channels] channel "${channel}" not implemented yet`);
      return { success: false, channel, skipped: true, error: "channel not implemented" };
    default: {
      // Exhaustiveness guard for the Channel union.
      const _exhaustive: never = channel;
      return { success: false, channel: _exhaustive, error: "unknown channel" };
    }
  }
}

async function sendWhatsApp(to: string, body: string): Promise<SendResult> {
  const channel: Channel = "whatsapp";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!phoneId || !token) {
    return { success: false, channel, skipped: true, error: "WhatsApp not configured" };
  }

  const recipient = to.replace(/\D/g, "");

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

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const error = `WhatsApp send failed (${res.status})${detail ? `: ${detail}` : ""}`;
      console.error("[channels]", error);
      return { success: false, channel, error };
    }

    return { success: true, channel };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[channels] WhatsApp send error", error);
    return { success: false, channel, error };
  }
}

async function sendSms(to: string, body: string): Promise<SendResult> {
  const channel: Channel = "sms";
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) {
    return { success: false, channel, skipped: true, error: "SMS not configured" };
  }

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const form = new URLSearchParams({ To: to, From: from, Body: body });

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const error = `SMS send failed (${res.status})${detail ? `: ${detail}` : ""}`;
      console.error("[channels]", error);
      return { success: false, channel, error };
    }

    return { success: true, channel };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[channels] SMS send error", error);
    return { success: false, channel, error };
  }
}

/**
 * Send to a patient honoring their preferred channel and consent (Plan 1.3).
 * `undefined` consent is treated as allowed for back-compat with un-migrated
 * rows; only an explicit `false` blocks the send.
 */
export async function sendToPatient(
  patient: { phone_number: string; preferred_channel?: Channel | null; consent_given?: boolean },
  body: string,
): Promise<SendResult> {
  const channel: Channel = patient.preferred_channel ?? "whatsapp";

  if (patient.consent_given === false) {
    return { success: false, channel, skipped: true, error: "no consent" };
  }

  return sendText({ to: patient.phone_number, body, channel });
}
