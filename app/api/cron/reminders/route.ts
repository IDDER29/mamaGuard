import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Plan 2.1 — appointment reminders. Sends a Darija WhatsApp reminder for
// appointments due within the next 48h that haven't been reminded yet.
// Gated by Authorization: Bearer ${CRON_SECRET}. Schedule in vercel.json.

interface DueAppointment {
  id: string;
  scheduled_at: string;
  location: string | null;
  patients: { name: string | null; full_name: string | null; phone_number: string | null } | null;
}

function buildReminder(name: string, whenISO: string, location: string | null): string {
  const d = new Date(whenISO);
  const date = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("fr-MA", { weekday: "long", day: "numeric", month: "long" });
  const time = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
  const place = location || "l-merkez d sse77a";
  return `Salam ${name}! 🧸 Tdkkir mn 3and Mama AI: 3andek maw3id dyal l-mraqaba (ANC) nhar ${date} f ${time}, f ${place}. 7awli tji f l-waqt 🇲🇦. Ila ma qdertich tji, goli lina bach n-bedlo l-maw3id.`;
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = await createAdminClient();
  const now = new Date();
  const horizon = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const { data: due, error } = await supabase
    .from("appointments")
    .select("id, scheduled_at, location, patients(name, full_name, phone_number)")
    .in("status", ["scheduled", "confirmed"])
    .is("reminder_sent_at", null)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", horizon.toISOString());

  if (error) {
    console.error("[cron/reminders]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  let sent = 0;

  for (const appt of (due ?? []) as unknown as DueAppointment[]) {
    const phone = appt.patients?.phone_number;
    if (!phone || !phoneId || !token) continue;
    const name = appt.patients?.full_name || appt.patients?.name || "l-mama";
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone.replace(/\D/g, ""),
          type: "text",
          text: { body: buildReminder(name, appt.scheduled_at, appt.location) },
        }),
      });
      if (res.ok) {
        await supabase
          .from("appointments")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", appt.id);
        sent++;
      } else {
        console.error("[cron/reminders] WhatsApp send failed", res.status);
      }
    } catch (e) {
      console.error("[cron/reminders] send error", e);
    }
  }

  return NextResponse.json({ success: true, due: due?.length ?? 0, sent });
}
