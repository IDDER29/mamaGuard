import { createAdminClient } from "@/utils/supabase/admin";
import {
  parseBloodPressureObservation,
  patientIdFromReference,
  type FhirObservation,
} from "@/lib/fhir/parse";

/**
 * POST /api/fhir/observation  (Plan E8.6)
 *
 * FHIR R4 write-back seam. Token-gated by `Authorization: Bearer ${FHIR_TOKEN}`.
 * Accepts a single `Observation` resource:
 *  - Blood-pressure panel (LOINC 85354-9 with 8480-6 / 8462-4 components) -> a
 *    `vitals` row, reusing the pre-eclampsia alert rule for hypertensive readings.
 *  - Any other / generic numeric Observation is recognized but not persisted ->
 *    422 OperationOutcome (we never silently store unknown clinical data).
 * Defensive about missing fields; replies in FHIR `OperationOutcome` style.
 */

function outcome(
  severity: "information" | "warning" | "error",
  code: string,
  diagnostics: string,
  init?: ResponseInit,
) {
  return Response.json(
    {
      resourceType: "OperationOutcome",
      issue: [{ severity, code, diagnostics }],
    },
    { headers: { "Content-Type": "application/fhir+json" }, ...init },
  );
}

export async function POST(req: Request) {
  // --- Auth: bearer token must be set and must match. ---
  const expected = process.env.FHIR_TOKEN?.trim();
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!expected || provided !== expected) {
    return outcome("error", "security", "Unauthorized", { status: 401 });
  }

  let obs: FhirObservation;
  try {
    obs = (await req.json()) as FhirObservation;
  } catch {
    return outcome("error", "invalid", "Invalid JSON", { status: 400 });
  }

  if (!obs || typeof obs !== "object" || obs.resourceType !== "Observation") {
    return outcome(
      "error",
      "invalid",
      "Expected a FHIR Observation resource",
      { status: 400 },
    );
  }

  const supabase = await createAdminClient();

  // --- Blood-pressure panel -> vitals (+ pre-eclampsia alert rule). ---
  const bp = parseBloodPressureObservation(obs);
  if (bp) {
    const recordedAt = bp.recordedAt ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("vitals")
      .insert({
        patient_id: bp.patientId,
        systolic: bp.systolic,
        diastolic: bp.diastolic,
        recorded_at: recordedAt,
        recorded_by: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[fhir/observation]", error);
      return outcome(
        "error",
        "processing",
        error?.message ?? "Insert failed",
        { status: 500 },
      );
    }

    if (bp.systolic >= 140 || bp.diastolic >= 90) {
      const urgency: "critical" | "high" =
        bp.systolic >= 160 || bp.diastolic >= 110 ? "critical" : "high";
      const symptomName = `FHIR BP ${bp.systolic}/${bp.diastolic} — pre-eclampsia concern`;

      const { error: alertError } = await supabase.from("alerts").insert({
        patient_id: bp.patientId,
        urgency,
        symptom_name: symptomName,
      });
      if (alertError) console.error("[fhir/observation] alert", alertError);

      const { error: notifyError } = await supabase.from("notifications").insert({
        type: urgency === "critical" ? "alert_critical" : "alert_high",
        title: `${urgency === "critical" ? "🚨 Critical" : "⚠️ High"} FHIR BP — ${bp.systolic}/${bp.diastolic}`,
        body: symptomName,
        entity_type: "alert",
        patient_id: bp.patientId,
      });
      if (notifyError) console.error("[fhir/observation] notification", notifyError);
    }

    return Response.json({ success: true, id: data.id }, { status: 201 });
  }

  // --- Recognized-but-unsupported Observation. ---
  // Surface a clear reason: if we can't even resolve the patient, say so;
  // otherwise it's an unsupported code (generic numeric Observation, etc.).
  const patientId = patientIdFromReference(obs.subject?.reference);
  const diagnostics = !patientId
    ? "Missing or unresolvable subject reference (expected 'Patient/<id>')"
    : "Unsupported Observation: only blood-pressure panels (LOINC 85354-9) are stored";

  return outcome("error", "not-supported", diagnostics, { status: 422 });
}
