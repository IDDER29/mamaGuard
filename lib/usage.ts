// lib/usage.ts
// Plan E7.1 hardening — best-effort usage metering. Each AI/messaging call logs
// a usage_events row so cost-per-mother is computed from real spend rather than
// an illustrative constant. Logging never throws into the call path.

import { createAdminClient } from "@/utils/supabase/admin";

export type UsageKind = "llm" | "stt" | "tts" | "whatsapp" | "sms";

// Illustrative unit prices (USD). Tune to your contracts; metering is real even
// if the per-unit prices are estimates.
const PRICES = {
  llm_per_1k_tokens: 0.0006, // ~gpt-4o-mini blended
  stt_per_call: 0.006, // ~Whisper per short clip
  tts_per_call: 0.01, // ~ElevenLabs per short clip
  whatsapp_per_msg: 0.005,
  sms_per_msg: 0.04,
} as const;

export function estimateCost(kind: UsageKind, units: number): number {
  switch (kind) {
    case "llm":
      return (units / 1000) * PRICES.llm_per_1k_tokens;
    case "stt":
      return units * PRICES.stt_per_call;
    case "tts":
      return units * PRICES.tts_per_call;
    case "whatsapp":
      return units * PRICES.whatsapp_per_msg;
    case "sms":
      return units * PRICES.sms_per_msg;
    default:
      return 0;
  }
}

export async function logUsage(
  kind: UsageKind,
  opts: { units?: number; patientId?: string | null; detail?: Record<string, unknown> } = {},
): Promise<void> {
  const units = opts.units ?? 1;
  try {
    const supabase = await createAdminClient();
    await supabase.from("usage_events").insert({
      kind,
      units,
      cost_usd: estimateCost(kind, units),
      patient_id: opts.patientId ?? null,
      detail: opts.detail ?? null,
    });
  } catch (e) {
    console.error("[logUsage]", e);
  }
}
