import { createAdminClient } from "@/utils/supabase/admin";
import { normalizePatient } from "@/lib/patients";
import {
  patientToFhir,
  vitalToObservation,
  epdsToObservation,
  toBundle,
} from "@/lib/fhir";

/**
 * GET /api/fhir/patient/[id]
 *
 * Returns a FHIR R4 collection Bundle for a single patient: the Patient resource
 * plus their vitals and EPDS screenings mapped to Observations.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createAdminClient();

  const { data: patientRow } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!patientRow) {
    return new Response("Not found", { status: 404 });
  }

  const resources: Record<string, unknown>[] = [
    patientToFhir(normalizePatient(patientRow as Record<string, unknown>)),
  ];

  // Vitals -> blood-pressure Observations (table may be empty / absent).
  try {
    const { data: vitals } = await supabase.from("vitals").select("*").eq("patient_id", id);
    for (const v of (vitals ?? []) as Record<string, unknown>[]) {
      const obs = vitalToObservation({
        id: String(v.id ?? ""),
        patient_id: id,
        recorded_at: String(v.recorded_at ?? ""),
        systolic: v.systolic != null ? Number(v.systolic) : null,
        diastolic: v.diastolic != null ? Number(v.diastolic) : null,
      });
      if (obs) resources.push(obs);
    }
  } catch {
    // Ignore: vitals table may not exist yet.
  }

  // EPDS screenings -> Observations (table may be empty / absent).
  try {
    const { data: epds } = await supabase
      .from("epds_screenings")
      .select("*")
      .eq("patient_id", id);
    for (const e of (epds ?? []) as Record<string, unknown>[]) {
      resources.push(
        epdsToObservation({
          id: String(e.id ?? ""),
          patient_id: id,
          created_at: String(e.created_at ?? ""),
          total_score: Number(e.total_score) || 0,
        }),
      );
    }
  } catch {
    // Ignore: epds_screenings table may not exist yet.
  }

  const bundle = toBundle(resources);

  return Response.json(bundle, {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
