import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Plan E1.1/E1.2 — SLA monitor. Scans unacknowledged act-now alerts and:
//   - at >=80% of the SLA window: raise a one-time 'sla_warning' notification
//   - past the SLA window: escalate (escalated_at + escalation_level) and raise
//     a one-time 'sla_breach' notification
// Gated by Authorization: Bearer ${CRON_SECRET}. Schedule frequently (vercel.json).

const SLA_MINUTES: Record<string, number> = { critical: 15, high: 60 };

interface ActiveAlert {
  id: string;
  patient_id: string;
  urgency: string;
  symptom_name: string | null;
  created_at: string;
  sla_warned: boolean;
  escalation_level: number;
  patients: { full_name: string | null; name: string | null } | null;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("id, patient_id, urgency, symptom_name, created_at, sla_warned, escalation_level, patients(full_name, name)")
    .eq("status", "active")
    .in("urgency", ["high", "critical"]);

  if (error) {
    console.error("[cron/sla-monitor]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  let warned = 0;
  let escalated = 0;

  for (const a of (data ?? []) as unknown as ActiveAlert[]) {
    const target = SLA_MINUTES[a.urgency];
    if (!target) continue;
    const elapsedMin = (now - new Date(a.created_at).getTime()) / 60000;
    const who = a.patients?.full_name || a.patients?.name || "A patient";

    if (elapsedMin >= target && a.escalation_level < 1) {
      await supabase
        .from("alerts")
        .update({ escalated_at: new Date().toISOString(), escalation_level: 1 })
        .eq("id", a.id);
      await supabase.from("notifications").insert({
        type: "sla_breach",
        title: `⏰ SLA breached — ${who}`,
        body: `${a.urgency} alert unacknowledged past ${target}m: ${a.symptom_name ?? "danger sign"}`,
        entity_type: "alert",
        entity_id: a.id,
        patient_id: a.patient_id,
      });
      escalated++;
    } else if (elapsedMin >= target * 0.8 && !a.sla_warned && a.escalation_level < 1) {
      await supabase.from("alerts").update({ sla_warned: true }).eq("id", a.id);
      await supabase.from("notifications").insert({
        type: "sla_warning",
        title: `⏳ SLA at risk — ${who}`,
        body: `${a.urgency} alert nearing its ${target}m SLA: ${a.symptom_name ?? "danger sign"}`,
        entity_type: "alert",
        entity_id: a.id,
        patient_id: a.patient_id,
      });
      warned++;
    }
  }

  return NextResponse.json({ success: true, scanned: data?.length ?? 0, warned, escalated });
}
