// Pure FHIR R4 parsing helpers (no I/O). Used by the FHIR Observation
// write-back route (Plan E8.6). Defensive against missing/loosely-typed fields:
// these resources arrive from third-party EHRs/devices over the wire.

// Minimal structural types for the FHIR R4 fragments we read. We keep these
// loose on purpose — real payloads vary by source and we never trust shape.
interface FhirCoding {
  system?: string;
  code?: string;
}

interface FhirCodeableConcept {
  coding?: FhirCoding[];
}

interface FhirQuantity {
  value?: number;
}

interface FhirObservationComponent {
  code?: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
}

export interface FhirObservation {
  resourceType?: string;
  code?: FhirCodeableConcept;
  subject?: { reference?: string };
  effectiveDateTime?: string;
  issued?: string;
  valueQuantity?: FhirQuantity;
  component?: FhirObservationComponent[];
}

// LOINC codes for the blood-pressure panel and its components.
const LOINC_BP_PANEL = "85354-9";
const LOINC_SYSTOLIC = "8480-6";
const LOINC_DIASTOLIC = "8462-4";

export interface ParsedBloodPressure {
  patientId: string;
  systolic: number;
  diastolic: number;
  recordedAt: string | null;
}

/**
 * Extract a patient id from a FHIR reference like "Patient/<uuid>".
 * Accepts bare ids and absolute URLs ending in "Patient/<id>". Returns null
 * when the reference is missing or does not point at a Patient resource.
 */
export function patientIdFromReference(ref?: string | null): string | null {
  if (typeof ref !== "string") return null;
  const trimmed = ref.trim();
  if (!trimmed) return null;

  // Match the last "Patient/<id>" segment (handles absolute URLs too).
  const match = trimmed.match(/Patient\/([^/?#]+)/);
  if (match && match[1]) return match[1];

  // Some senders omit the type prefix and pass a bare id; accept that only
  // when it looks like a single path segment (no slashes).
  if (!trimmed.includes("/")) return trimmed;

  return null;
}

function codesOf(concept?: FhirCodeableConcept): string[] {
  if (!concept || !Array.isArray(concept.coding)) return [];
  return concept.coding
    .map((c) => (typeof c?.code === "string" ? c.code : null))
    .filter((c): c is string => c != null);
}

function componentValue(
  components: FhirObservationComponent[] | undefined,
  loinc: string,
): number | null {
  if (!Array.isArray(components)) return null;
  for (const comp of components) {
    if (codesOf(comp?.code).includes(loinc)) {
      const v = comp?.valueQuantity?.value;
      if (typeof v === "number" && Number.isFinite(v)) return v;
    }
  }
  return null;
}

/**
 * Parse a FHIR R4 blood-pressure panel Observation (LOINC 85354-9) into a flat
 * record. Returns null when the resource is not a recognizable BP panel, when
 * the subject reference is unusable, or when systolic/diastolic are missing.
 */
export function parseBloodPressureObservation(
  obs: FhirObservation | null | undefined,
): ParsedBloodPressure | null {
  if (!obs || typeof obs !== "object") return null;
  if (obs.resourceType && obs.resourceType !== "Observation") return null;

  if (!codesOf(obs.code).includes(LOINC_BP_PANEL)) return null;

  const patientId = patientIdFromReference(obs.subject?.reference);
  if (!patientId) return null;

  const systolic = componentValue(obs.component, LOINC_SYSTOLIC);
  const diastolic = componentValue(obs.component, LOINC_DIASTOLIC);
  if (systolic == null || diastolic == null) return null;

  const recordedAt =
    (typeof obs.effectiveDateTime === "string" && obs.effectiveDateTime) ||
    (typeof obs.issued === "string" && obs.issued) ||
    null;

  return { patientId, systolic, diastolic, recordedAt };
}
