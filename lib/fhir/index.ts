/**
 * Pure mapping functions from internal MamaGuard models to HL7 FHIR R4 resources.
 *
 * These are plain object builders — no SDK, no I/O. Each function returns a
 * `Record<string, unknown>` shaped as the corresponding FHIR resource so callers
 * can assemble them into a Bundle (see `toBundle`).
 */

/** Map an internal patient to a FHIR R4 `Patient` resource. */
export function patientToFhir(p: {
  id: string;
  full_name: string | null;
  name: string;
  phone_number: string;
  date_of_birth: string | null;
  language: string;
}): Record<string, unknown> {
  const resource: Record<string, unknown> = {
    resourceType: "Patient",
    id: p.id,
    name: [{ text: p.full_name ?? p.name }],
    telecom: [{ system: "phone", value: p.phone_number }],
    communication: [{ language: { text: p.language } }],
  };
  if (p.date_of_birth) {
    resource.birthDate = p.date_of_birth;
  }
  return resource;
}

/**
 * Map a blood-pressure vital to a FHIR R4 `Observation` (LOINC 85354-9 panel).
 * Skips a component whose value is null; returns null when both are null.
 */
export function vitalToObservation(v: {
  id: string;
  patient_id: string;
  recorded_at: string;
  systolic: number | null;
  diastolic: number | null;
}): Record<string, unknown> | null {
  if (v.systolic == null && v.diastolic == null) {
    return null;
  }

  const component: Record<string, unknown>[] = [];
  if (v.systolic != null) {
    component.push({
      code: {
        coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }],
      },
      valueQuantity: {
        value: v.systolic,
        unit: "mmHg",
        system: "http://unitsofmeasure.org",
        code: "mm[Hg]",
      },
    });
  }
  if (v.diastolic != null) {
    component.push({
      code: {
        coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }],
      },
      valueQuantity: {
        value: v.diastolic,
        unit: "mmHg",
        system: "http://unitsofmeasure.org",
        code: "mm[Hg]",
      },
    });
  }

  return {
    resourceType: "Observation",
    id: v.id,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs",
          },
        ],
      },
    ],
    code: {
      coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }],
      text: "Blood pressure panel",
    },
    subject: { reference: `Patient/${v.patient_id}` },
    effectiveDateTime: v.recorded_at,
    component,
  };
}

/** Map an EPDS screening to a FHIR R4 `Observation`. */
export function epdsToObservation(e: {
  id: string;
  patient_id: string;
  created_at: string;
  total_score: number;
}): Record<string, unknown> {
  return {
    resourceType: "Observation",
    id: e.id,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "survey",
            display: "Survey",
          },
        ],
      },
    ],
    code: { text: "EPDS score" },
    subject: { reference: `Patient/${e.patient_id}` },
    effectiveDateTime: e.created_at,
    valueInteger: e.total_score,
  };
}

/** Map a referral to a FHIR R4 `ServiceRequest`. */
export function referralToServiceRequest(r: {
  id: string;
  patient_id: string;
  reason: string | null;
  status: string;
}): Record<string, unknown> {
  const status =
    r.status === "created"
      ? "active"
      : r.status === "completed"
        ? "completed"
        : r.status === "cancelled"
          ? "revoked"
          : "active";

  const resource: Record<string, unknown> = {
    resourceType: "ServiceRequest",
    id: r.id,
    status,
    intent: "order",
    subject: { reference: `Patient/${r.patient_id}` },
  };
  if (r.reason) {
    resource.reasonCode = [{ text: r.reason }];
  }
  return resource;
}

/** Wrap an array of FHIR resources into a collection `Bundle`. */
export function toBundle(resources: Record<string, unknown>[]): Record<string, unknown> {
  return {
    resourceType: "Bundle",
    type: "collection",
    entry: resources.map((r) => ({ resource: r })),
  };
}
