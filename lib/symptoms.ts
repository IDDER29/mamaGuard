// lib/symptoms.ts
// DEPRECATED as the rules home. The naive keyword/substring matcher has been
// replaced by the validated, deterministic, conservative WHO-ANC-DAK engine in
// `lib/triage.ts` (Plan 1.1). This file remains a thin compatibility layer.

export {
  analyzeSymptomRisk,
  assessTriage,
  TRIAGE_VERSION,
  DANGER_SIGNS,
  type UrgencyLevel,
  type TriageResult,
  type MatchedSign,
  type DangerSign,
} from "./triage";
