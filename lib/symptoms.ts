export const SYMPTOMS_DATABASE = {
  preeclampsia: {
    keywords: {
      darija: [
        "صداع",
        "راسي كيوجعني",
        "البصر مشوش",
        "ما كنشوفش مزيان",
        "ورمة",
        "رجلي ورمو",
      ],
      english: ["headache", "blurry vision", "swelling", "pain under ribs"],
    },
    severity: {
      mild: ["خفيف صداع", "slight headache"],
      severe: [
        "vision blurry",
        "البصر مشوش",
        "headache severe",
        "صداع قوي بزاف",
      ],
    },
    urgency: "high" as const,
  },
  gestationalDiabetes: {
    keywords: {
      darija: ["عطش بزاف", "كنتبول بزاف", "تعب"],
      english: ["excessive thirst", "frequent urination", "fatigue"],
    },
    urgency: "medium" as const,
  },
  pretermLabor: {
    keywords: {
      darija: ["ألم", "انقباضات", "كرشي كيوجعني", "ظهري كيوجعني"],
      english: ["contractions", "pain", "cramping", "back pain"],
    },
    urgency: "critical" as const,
  },
  bleeding: {
    keywords: {
      darija: ["دم", "نزيف", "كنفرس"],
      english: ["bleeding", "blood", "spotting"],
    },
    urgency: "critical" as const,
  },
} as const;

export type SymptomId = keyof typeof SYMPTOMS_DATABASE;
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

const URGENCY_ORDER: Record<UrgencyLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function getAllKeywords(
  symptomId: SymptomId
): { keyword: string; urgency: UrgencyLevel }[] {
  const entry = SYMPTOMS_DATABASE[symptomId];
  const list: { keyword: string; urgency: UrgencyLevel }[] = [];
  for (const k of entry.keywords.darija) {
    list.push({ keyword: k, urgency: entry.urgency });
  }
  for (const k of entry.keywords.english) {
    list.push({ keyword: k, urgency: entry.urgency });
  }
  if ("severity" in entry) {
    for (const k of entry.severity.mild) {
      list.push({ keyword: k, urgency: entry.urgency });
    }
    for (const k of entry.severity.severe) {
      list.push({ keyword: k, urgency: entry.urgency });
    }
  }
  return list;
}

export type SymptomRiskResult = {
  urgency: UrgencyLevel;
  symptom: SymptomId | null;
};

/**
 * Scans a Darija (or mixed) text message against the symptoms keyword database.
 * Returns the highest-urgency matched symptom, or low risk if no match.
 */
export function analyzeSymptomRisk(message: string): SymptomRiskResult {
  const normalized = normalizeText(message);
  let best: { symptom: SymptomId; urgency: UrgencyLevel } | null = null;

  for (const symptomId of Object.keys(SYMPTOMS_DATABASE) as SymptomId[]) {
    const keywords = getAllKeywords(symptomId);
    for (const { keyword, urgency } of keywords) {
      const keyNorm = normalizeText(keyword);
      if (normalized.includes(keyNorm)) {
        if (
          !best ||
          URGENCY_ORDER[urgency] > URGENCY_ORDER[best.urgency]
        ) {
          best = { symptom: symptomId, urgency };
        }
      }
    }
  }

  if (best) {
    return { urgency: best.urgency, symptom: best.symptom };
  }
  return { urgency: "low", symptom: null };
}
