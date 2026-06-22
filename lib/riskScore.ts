// lib/riskScore.ts
// Plan E8.2 — predictive risk stratification. A transparent, deterministic
// heuristic over the data we already collect (rule-based, NOT a black-box ML
// model). It SURFACES concern for clinician attention; it never replaces the
// deterministic triage engine (lib/triage.ts), which alone drives urgency.

export interface RiskInputs {
  riskLevel?: "low" | "medium" | "high" | "critical" | string | null;
  latestSystolic?: number | null;
  latestDiastolic?: number | null;
  epdsRisk?: boolean;
  epdsSelfHarm?: boolean;
  missedVisits?: number;
}

export type RiskBand = "low" | "moderate" | "elevated" | "high";

export interface RiskResult {
  score: number; // 0–100
  band: RiskBand;
  reasons: string[];
}

export function computeRiskScore(input: RiskInputs): RiskResult {
  let score = 0;
  const reasons: string[] = [];

  switch (input.riskLevel) {
    case "critical":
      score += 45;
      reasons.push("Active critical triage");
      break;
    case "high":
      score += 30;
      reasons.push("Active high triage");
      break;
    case "medium":
      score += 12;
      reasons.push("Active medium triage");
      break;
  }

  const sys = input.latestSystolic ?? 0;
  const dia = input.latestDiastolic ?? 0;
  if (sys >= 160 || dia >= 110) {
    score += 40;
    reasons.push(`Severe-range BP ${sys}/${dia}`);
  } else if (sys >= 140 || dia >= 90) {
    score += 25;
    reasons.push(`Elevated BP ${sys}/${dia}`);
  }

  if (input.epdsSelfHarm) {
    score += 35;
    reasons.push("EPDS self-harm item positive");
  } else if (input.epdsRisk) {
    score += 18;
    reasons.push("EPDS above at-risk threshold");
  }

  if ((input.missedVisits ?? 0) > 0) {
    score += Math.min(15, (input.missedVisits ?? 0) * 8);
    reasons.push(`${input.missedVisits} missed visit(s)`);
  }

  score = Math.min(100, score);
  const band: RiskBand =
    score >= 75 ? "high" : score >= 50 ? "elevated" : score >= 20 ? "moderate" : "low";
  return { score, band, reasons };
}
