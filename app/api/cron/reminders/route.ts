import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendToPatient, type Channel } from "@/lib/channels";

// Plan 2.1 — appointment reminders. Sends a Darija WhatsApp reminder for
// appointments due within the next 48h that haven't been reminded yet.
// Gated by Authorization: Bearer ${CRON_SECRET}. Schedule in vercel.json.

interface DueAppointment {
  id: string;
  scheduled_at: string;
  location: string | null;
  meeting_url: string | null;
  patients: {
    name: string | null;
    full_name: string | null;
    phone_number: string | null;
    preferred_channel: Channel | null;
    consent_given: boolean | null;
  } | null;
}

function buildReminder(
  name: string,
  whenISO: string,
  location: string | null,
  meetingUrl?: string | null,
): string {
  const d = new Date(whenISO);
  const date = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("fr-MA", { weekday: "long", day: "numeric", month: "long" });
  const time = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
  if (meetingUrl) {
    return `Salam ${name}! 🧸 Tdkkir mn 3and Mama AI: 3andek mo9abala 3an bo3d (teleconsult) nhar ${date} f ${time}. Dkhli mn had l-link f l-waqt: ${meetingUrl} 🇲🇦`;
  }
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
    .select(
      "id, scheduled_at, location, meeting_url, patients(name, full_name, phone_number, preferred_channel, consent_given)",
    )
    .in("status", ["scheduled", "confirmed"])
    .is("reminder_sent_at", null)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", horizon.toISOString());

  if (error) {
    console.error("[cron/reminders]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;

  for (const appt of (due ?? []) as unknown as DueAppointment[]) {
    const p = appt.patients;
    if (!p?.phone_number) continue;
    const name = p.full_name || p.name || "l-mama";
    // Channel layer enforces consent + per-patient channel (Plan 1.3 / 2.2).
    const res = await sendToPatient(
      {
        phone_number: p.phone_number,
        preferred_channel: p.preferred_channel,
        consent_given: p.consent_given ?? undefined,
      },
      buildReminder(name, appt.scheduled_at, appt.location, appt.meeting_url),
    );
    if (res.success) {
      await supabase
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appt.id);
      sent++;
    }
  }

  // Auto-flag missed visits (Plan 2.1): >24h past and still not completed.
  const missedBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data: missed } = await supabase
    .from("appointments")
    .update({ status: "missed", updated_at: new Date().toISOString() })
    .in("status", ["scheduled", "confirmed"])
    .lt("scheduled_at", missedBefore)
    .select("id");

  // Retention purge (Plan E6.2): delete patients past their retention horizon.
  const { data: purged } = await supabase
    .from("patients")
    .delete()
    .not("data_retention_until", "is", null)
    .lt("data_retention_until", new Date().toISOString().slice(0, 10))
    .select("id");

  return NextResponse.json({
    success: true,
    due: due?.length ?? 0,
    sent,
    missed: missed?.length ?? 0,
    purged: purged?.length ?? 0,
  });
}
