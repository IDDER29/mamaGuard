import { createAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/ingest/vitals  (Plan E8.3)
 *
 * Device / wearable blood-pressure (and basic vitals) ingestion seam. Token-gated
 * by `Authorization: Bearer ${INGEST_TOKEN}`. Writes a `vitals` row and, when the
 * reading is hypertensive, reuses the pre-eclampsia alert rule (mirrors
 * `app/actions/vitals.ts` and the webhook): raises an `alerts` row plus a clinician
 * `notifications` row so elevated device readings reach the act-now queue.
 */

interface VitalsIngestBody {
  patient_id?: unknown;
  systolic?: unknown;
  diastolic?: unknown;
  heart_rate?: unknown;
  temperature?: unknown;
  recorded_at?: unknown;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export async function POST(req: Request) {
  // --- Auth: bearer token must be set and must match. ---
  const expected = process.env.INGEST_TOKEN?.trim();
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!expected || provided !== expected) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: VitalsIngestBody;
  try {
    body = (await req.json()) as VitalsIngestBody;
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const patientId = typeof body.patient_id === "string" ? body.patient_id.trim() : "";
  if (!patientId) {
    return Response.json(
      { success: false, error: "patient_id is required" },
      { status: 400 },
    );
  }

  const systolic = asNumber(body.systolic);
  const diastolic = asNumber(body.diastolic);
  const heartRate = asNumber(body.heart_rate);
  const temperature = asNumber(body.temperature);
  const recordedAt =
    typeof body.recorded_at === "string" && body.recorded_at.trim() !== ""
      ? body.recorded_at.trim()
      : new Date().toISOString();

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("vitals")
    .insert({
      patient_id: patientId,
      systolic,
      diastolic,
      heart_rate: heartRate,
      temperature,
      recorded_at: recordedAt,
      recorded_by: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[ingest/vitals]", error);
    return Response.json(
      { success: false, error: error?.message ?? "Insert failed" },
      { status: 500 },
    );
  }

  // --- Reuse the pre-eclampsia alert rule for hypertensive readings. ---
  if (
    systolic != null &&
    diastolic != null &&
    (systolic >= 140 || diastolic >= 90)
  ) {
    const urgency: "critical" | "high" =
      systolic >= 160 || diastolic >= 110 ? "critical" : "high";
    const symptomName = `Device BP ${systolic}/${diastolic} — pre-eclampsia concern`;

    const { error: alertError } = await supabase.from("alerts").insert({
      patient_id: patientId,
      urgency,
      symptom_name: symptomName,
    });
    if (alertError) console.error("[ingest/vitals] alert", alertError);

    const { error: notifyError } = await supabase.from("notifications").insert({
      type: urgency === "critical" ? "alert_critical" : "alert_high",
      title: `${urgency === "critical" ? "🚨 Critical" : "⚠️ High"} device BP — ${systolic}/${diastolic}`,
      body: symptomName,
      entity_type: "alert",
      patient_id: patientId,
    });
    if (notifyError) console.error("[ingest/vitals] notification", notifyError);
  }

  return Response.json({ success: true, id: data.id });
}
