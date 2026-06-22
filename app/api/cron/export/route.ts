import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Plan E7.2 — scheduled program export. Builds a patient CSV and, if
// REPORT_WEBHOOK_URL is set, POSTs it there (e.g. a storage/email webhook);
// otherwise returns a summary. CRON_SECRET-gated; schedule in vercel.json.

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name, phone_number, gestational_week, risk_level, postpartum, preferred_channel, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[cron/export]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = ["id", "full_name", "phone_number", "gestational_week", "risk_level", "postpartum", "preferred_channel", "created_at"];
  const rows = (data ?? []).map((r) => header.map((h) => csvCell((r as Record<string, unknown>)[h])).join(","));
  const csv = [header.join(","), ...rows].join("\n");

  const webhook = process.env.REPORT_WEBHOOK_URL?.trim();
  let delivered = false;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "text/csv", "X-Report": "mamaguard-patients" },
        body: csv,
      });
      delivered = res.ok;
      if (!res.ok) console.error("[cron/export] webhook failed", res.status);
    } catch (e) {
      console.error("[cron/export] webhook error", e);
    }
  }

  return NextResponse.json({ success: true, rows: data?.length ?? 0, delivered });
}
