"use server";

// Plan E7.1/E7.3 — program metrics: SLA adherence, referral/visit outcomes, and
// an illustrative cost-per-mother. Gated by the 'report' capability.

import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentProfile } from "@/app/actions/profiles";
import { can } from "@/lib/roles";

const SLA_MIN: Record<string, number> = { critical: 15, high: 60 };
// Per-message price for channel sends (no provider usage row; derived from the
// delivery log). AI cost (llm/stt/tts) comes from real usage_events spend.
const PRICE_WHATSAPP = 0.005;
const PRICE_SMS = 0.04;
// Fallback only when there is no metered data at all.
const COST_PER_MESSAGE_USD = 0.012;

export interface ProgramMetrics {
  totalPatients: number;
  totalMessages: number;
  slaActionable: number;
  slaWithinTarget: number;
  slaAdherencePct: number | null;
  referralOutcomes: Record<string, number>;
  visitsCompleted: number;
  visitsMissed: number;
  estMonthlyCostUsd: number;
  estCostPerMotherUsd: number | null;
  /** True when no metered usage exists yet and the figure is an estimate. */
  illustrative: boolean;
}

export async function programMetrics(): Promise<ProgramMetrics | null> {
  const me = await getCurrentProfile();
  if (!can(me.role, "report")) return null;
  const supabase = await createAdminClient();

  const [pc, mc, alertsRes, refRes, apptRes, usageRes, deliveriesRes] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("alerts").select("urgency, created_at, acknowledged_at").in("urgency", ["high", "critical"]),
    supabase.from("referrals").select("status"),
    supabase.from("appointments").select("status"),
    supabase.from("usage_events").select("cost_usd"),
    supabase.from("message_deliveries").select("channel").eq("status", "sent"),
  ]);

  // SLA adherence over acknowledged act-now alerts.
  let slaActionable = 0;
  let slaWithinTarget = 0;
  for (const a of (alertsRes.data ?? []) as { urgency: string; created_at: string; acknowledged_at: string | null }[]) {
    if (!a.acknowledged_at) continue;
    const target = SLA_MIN[a.urgency];
    if (!target) continue;
    slaActionable++;
    const mins = (new Date(a.acknowledged_at).getTime() - new Date(a.created_at).getTime()) / 60000;
    if (mins <= target) slaWithinTarget++;
  }

  const referralOutcomes: Record<string, number> = {};
  for (const r of (refRes.data ?? []) as { status: string }[]) {
    referralOutcomes[r.status] = (referralOutcomes[r.status] ?? 0) + 1;
  }

  let visitsCompleted = 0;
  let visitsMissed = 0;
  for (const v of (apptRes.data ?? []) as { status: string }[]) {
    if (v.status === "completed") visitsCompleted++;
    else if (v.status === "missed") visitsMissed++;
  }

  const totalPatients = pc.count ?? 0;
  const totalMessages = mc.count ?? 0;

  // Real metered cost: AI spend (usage_events) + channel sends (delivery log).
  const aiCost = ((usageRes.data ?? []) as { cost_usd: number | string | null }[]).reduce(
    (sum, u) => sum + Number(u.cost_usd ?? 0),
    0,
  );
  let msgCost = 0;
  for (const d of (deliveriesRes.data ?? []) as { channel: string }[]) {
    msgCost += d.channel === "sms" ? PRICE_SMS : PRICE_WHATSAPP;
  }
  const metered = aiCost + msgCost;
  const hasMeteredData = (usageRes.data?.length ?? 0) > 0 || (deliveriesRes.data?.length ?? 0) > 0;
  const estMonthlyCostUsd = hasMeteredData
    ? Math.round(metered * 100) / 100
    : Math.round(totalMessages * COST_PER_MESSAGE_USD * 100) / 100;

  return {
    totalPatients,
    totalMessages,
    slaActionable,
    slaWithinTarget,
    slaAdherencePct: slaActionable ? Math.round((slaWithinTarget / slaActionable) * 100) : null,
    referralOutcomes,
    visitsCompleted,
    visitsMissed,
    estMonthlyCostUsd,
    estCostPerMotherUsd: totalPatients
      ? Math.round((estMonthlyCostUsd / totalPatients) * 100) / 100
      : null,
    illustrative: !hasMeteredData,
  };
}
