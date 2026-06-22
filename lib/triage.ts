// lib/triage.ts
// Plan 1.1 — Validated triage engine (replaces naive keyword/substring matching).
//
// Design principles (see IMPLEMENTATION_ROADMAP.md Plan 1.1):
//   1. Danger signs grounded in the WHO Antenatal Care Digital Adaptation Kit (DAK).
//   2. DETERMINISTIC: same input -> same urgency. Versioned for auditability.
//   3. CONSERVATIVE: when uncertain, escalate. Co-occurring pre-eclampsia signs
//      escalate to critical. The LLM layer must never downgrade this result.
//   4. NEGATION-AWARE and multilingual (Moroccan Darija in Arabic + Latin script,
//      French, English) so "ما كاينش دم" / "no bleeding" / "pas de saignement"
//      does not trigger a false positive.
//
// This module is intentionally self-contained (no imports) so it can be unit-tested
// directly with `node --experimental-strip-types`.

/** Bump when rules change; stored on every assessment for audit/repro. */
export const TRIAGE_VERSION = "who-anc-dak-v2";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

const URGENCY_ORDER: Record<UrgencyLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export interface DangerSign {
  id: string;
  /** Human-readable clinical label (English). */
  label: string;
  urgency: UrgencyLevel;
  /** Normalized substrings across Darija (ar+latin), French, English. */
  patterns: string[];
}

export interface MatchedSign {
  id: string;
  label: string;
  urgency: UrgencyLevel;
  /** The pattern text that matched (for audit). */
  matched: string;
}

export interface TriageResult {
  urgency: UrgencyLevel;
  version: string;
  /** Highest-urgency sign id, or null. Back-compat with the old API. */
  symptom: string | null;
  /** All non-negated signs detected, highest urgency first. */
  signs: MatchedSign[];
  /** True when a co-occurrence rule escalated the result. */
  escalated: boolean;
}

// --- WHO ANC danger signs ---------------------------------------------------
// Urgency is deliberately conservative. Patterns favour recall (catch the sign)
// because negation handling below removes the common false positives.
export const DANGER_SIGNS: DangerSign[] = [
  {
    id: "vaginal_bleeding",
    label: "Vaginal bleeding",
    urgency: "critical",
    patterns: [
      "دم", "نزيف", "كنزف", "كنفرس", "خرج ليا الدم", "نازفة",
      "dem", "nazif", "kanzif", "bleeding", "blood", "saignement", "saigne", "perte de sang", "hemorrag",
    ],
  },
  {
    id: "convulsions",
    label: "Convulsions / fits (eclampsia)",
    urgency: "critical",
    patterns: [
      "تشنج", "تشنجات", "نوبة", "صرع", "رعشة قوية",
      "tachanouj", "convuls", "seizure", "fit", "fits", "crise", "convulsion",
    ],
  },
  {
    id: "loss_of_consciousness",
    label: "Loss of consciousness / fainting",
    urgency: "critical",
    patterns: [
      "غيبوبة", "غابت", "ما كتجاوبش", "طاحت مغمى",
      "ghaybouba", "unconscious", "fainted", "passed out", "evanoui", "perte de connaissance",
    ],
  },
  {
    id: "severe_breathing_difficulty",
    label: "Severe difficulty breathing",
    urgency: "critical",
    patterns: [
      "ما قادراش نتنفس", "تنفس صعيب", "خنقة", "ضيق التنفس",
      "ma qadrach ntnfs", "can't breathe", "cannot breathe", "difficulty breathing", "shortness of breath",
      "essoufflement", "difficulté à respirer", "j'étouffe",
    ],
  },
  {
    id: "no_fetal_movement",
    label: "Baby not moving / no fetal movement",
    urgency: "critical",
    patterns: [
      "ما كيتحركش", "البيبي ما كيتحركش", "ولد ما كيتحرك", "ما حسيتش بيه",
      "ma kaytharkach", "baby not moving", "not moving", "no movement", "no kicks",
      "bébé ne bouge pas", "ne bouge plus", "pas de mouvement",
    ],
  },
  {
    id: "severe_headache",
    label: "Severe headache",
    urgency: "high",
    patterns: [
      "صداع", "راسي كيوجعني", "صداع قوي", "وجع راس قوي",
      "souda3", "rassi kayweja3", "headache", "head ache", "mal de tête", "maux de tête", "migraine",
    ],
  },
  {
    id: "blurred_vision",
    label: "Blurred / disturbed vision",
    urgency: "high",
    patterns: [
      "البصر مشوش", "ما كنشوفش مزيان", "ضباب فعيني", "كنشوف ضباب",
      "bsar mchawach", "blurred vision", "blurry vision", "can't see well", "vision trouble",
      "vue floue", "trouble de la vision", "je vois flou",
    ],
  },
  {
    id: "severe_abdominal_pain",
    label: "Severe abdominal pain",
    urgency: "high",
    patterns: [
      "كرشي كيوجعني بزاف", "وجع فالكرش قوي", "ألم البطن", "وجع قوي فكرشي",
      "krchi kaywja3", "abdominal pain", "stomach pain", "belly pain severe",
      "douleur abdominale", "mal au ventre",
    ],
  },
  {
    id: "swelling_edema",
    label: "Swelling of face / hands (oedema)",
    urgency: "high",
    patterns: [
      "ورمة", "رجلي ورمو", "وجهي تورم", "يدي ورمو", "تورم",
      "warma", "swelling", "swollen", "oedeme", "œdème", "gonflement", "enflé",
    ],
  },
  {
    id: "leaking_fluid",
    label: "Leaking amniotic fluid / waters broke",
    urgency: "high",
    patterns: [
      "نزل ليا الما", "تهرس كيس الما", "كيخرج ليا الما", "سائل",
      "nzel lia lma", "water broke", "leaking water", "leaking fluid", "waters broke",
      "perte des eaux", "perte de liquide",
    ],
  },
  {
    id: "preterm_contractions",
    label: "Contractions / signs of preterm labour",
    urgency: "high",
    patterns: [
      "انقباضات", "طلق", "تقلصات", "ظهري كيوجعني بزاف",
      "ingibadat", "talq", "contractions", "labor pains", "labour", "contractions précoces",
    ],
  },
  {
    id: "high_fever",
    label: "High fever",
    urgency: "high",
    patterns: [
      "سخانة", "حمى", "سخون بزاف", "حرارة عالية",
      "skhana", "fever", "high temperature", "fièvre", "température élevée",
    ],
  },
  {
    id: "severe_vomiting",
    label: "Severe / persistent vomiting",
    urgency: "high",
    patterns: [
      "كنتقيا بزاف", "تقيؤ مستمر", "ما قادراش ناكل",
      "kantqya bzaf", "vomiting a lot", "can't keep food", "severe vomiting",
      "vomissements", "je vomis beaucoup",
    ],
  },
  {
    id: "painful_urination",
    label: "Painful urination",
    urgency: "medium",
    patterns: [
      "كيحرقني البول", "وجع فالتبويل", "حرقان",
      "kayhrekni lbol", "painful urination", "burning urination", "brûlure urinaire", "dysurie",
    ],
  },
  {
    id: "dizziness",
    label: "Dizziness / weakness",
    urgency: "medium",
    patterns: [
      "دوخة", "كندوخ", "ضعف", "تعب قوي",
      "doukha", "dizzy", "dizziness", "vertige", "faiblesse", "étourdissement",
    ],
  },
  {
    id: "gestational_diabetes",
    label: "Excessive thirst / frequent urination (GDM)",
    urgency: "medium",
    patterns: [
      "عطش بزاف", "كنتبول بزاف", "عندي عطش دايم",
      "3atch bzaf", "excessive thirst", "frequent urination", "soif excessive", "urine fréquente",
    ],
  },
];

// --- Postpartum danger signs (Phase 3) --------------------------------------
// Only evaluated when the patient is in postpartum mode. Conservative: maternal
// mortality post-delivery is driven by haemorrhage, sepsis and severe mental
// health crises, so these are weighted heavily.
export const POSTPARTUM_DANGER_SIGNS: DangerSign[] = [
  {
    id: "postpartum_hemorrhage",
    label: "Postpartum heavy bleeding / haemorrhage",
    urgency: "critical",
    patterns: [
      "نزيف بعد الولادة", "دم بزاف بعد الولادة", "كنزف بزاف", "الدم ما كيوقفش", "خرج ليا دم بزاف",
      "kanzif bezzaf", "nazif b3d l-wlada", "heavy bleeding", "soaking pad", "soaking pads",
      "postpartum bleeding", "saigne beaucoup", "hemorragie",
    ],
  },
  {
    id: "puerperal_infection",
    label: "Postpartum infection (fever / foul lochia)",
    urgency: "high",
    patterns: [
      "ريحة خايبة", "ريحة كريهة", "افرازات خايبة", "التهاب بعد الولادة", "صديد",
      "riha khayba", "foul smell", "foul discharge", "smelly discharge", "infection",
      "lochies malodorantes", "pus",
    ],
  },
  {
    id: "postpartum_self_harm",
    label: "Postpartum self-harm / suicidal thoughts",
    urgency: "critical",
    patterns: [
      "بغيت نموت", "نقتل راسي", "ما بقيتش باغية نعيش", "نأذي راسي", "نأذي البيبي",
      "bghit nmot", "nqtel rassi", "kill myself", "hurt myself", "harm the baby", "suicide",
      "je veux mourir", "me faire du mal",
    ],
  },
  {
    id: "postpartum_depression",
    label: "Postpartum low mood / depression",
    urgency: "high",
    patterns: [
      "كنبكي بزاف", "حزينة بزاف", "ما عنديش فرحة", "ما قادراش نهتم بالبيبي", "كرهت كلشي",
      "kanbki bezzaf", "7zina bezzaf", "ma3andich far7a", "depression", "deprime",
      "je pleure beaucoup", "no joy",
    ],
  },
  {
    id: "mastitis",
    label: "Breast pain / mastitis",
    urgency: "medium",
    patterns: [
      "البزولة كتوجعني", "صدري كيوجعني", "البزولة حامية", "كتلة فالبزولة",
      "bzoula katweja3", "breast pain", "sore breast", "mastitis", "sein douloureux", "mastite",
    ],
  },
];

// --- Co-occurrence escalation (conservative) --------------------------------
// Pre-eclampsia: headache + (blurred vision OR swelling) -> critical.
interface EscalationRule {
  whenAll: string[];
  whenAny?: string[];
  to: UrgencyLevel;
  reason: string;
}
const ESCALATIONS: EscalationRule[] = [
  {
    whenAll: ["severe_headache"],
    whenAny: ["blurred_vision", "swelling_edema"],
    to: "critical",
    reason: "pre-eclampsia cluster",
  },
];

// --- Negation handling ------------------------------------------------------
// NOTE: deliberately exclude the bare particle "ما" — it is too broad and could
// suppress a real danger sign (under-triage). We rely on explicit negation
// phrases instead, which is the safer (conservative) choice.
const NEGATION_MARKERS = [
  // Darija / Arabic (explicit forms only)
  "ماشي", "ماكاينش", "ما كاينش", "ماعنديش", "ما عنديش", "بلا", "ماكينش", "ما كينش",
  // Latin Darija
  "makaynch", "ma kaynch", "ma3andich", "ma 3andich", "bla ",
  // French
  "pas de", "aucun", "aucune", "sans ", "plus de",
  // English
  "no ", "not ", "without", "don't", "dont", "didn't", "didnt", "never", "no more", "free of",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "") // strip Arabic diacritics + tatweel
    .replace(/\s+/g, " ")
    .trim();
}

/** Is the match at `index` preceded by a negation marker within a short window? */
function isNegated(haystack: string, index: number): boolean {
  const windowStart = Math.max(0, index - 18);
  const before = haystack.slice(windowStart, index);
  return NEGATION_MARKERS.some((m) => before.includes(m));
}

/**
 * Assess a (possibly transcribed) message for WHO ANC danger signs.
 * Deterministic and conservative; returns the highest urgency found.
 * When `opts.postpartum` is true, postpartum-specific signs are also evaluated.
 */
export function assessTriage(
  message: string,
  opts?: { postpartum?: boolean },
): TriageResult {
  const text = normalize(message);
  const found = new Map<string, MatchedSign>();
  const signsToCheck = opts?.postpartum
    ? [...DANGER_SIGNS, ...POSTPARTUM_DANGER_SIGNS]
    : DANGER_SIGNS;

  for (const sign of signsToCheck) {
    for (const pattern of sign.patterns) {
      const p = normalize(pattern);
      if (!p) continue;
      const idx = text.indexOf(p);
      if (idx === -1) continue;
      if (isNegated(text, idx)) continue; // negated -> skip (conservative but safe)
      // Keep the first match per sign.
      if (!found.has(sign.id)) {
        found.set(sign.id, {
          id: sign.id,
          label: sign.label,
          urgency: sign.urgency,
          matched: pattern,
        });
      }
      break;
    }
  }

  const signs = [...found.values()].sort(
    (a, b) => URGENCY_ORDER[b.urgency] - URGENCY_ORDER[a.urgency],
  );

  let urgency: UrgencyLevel = signs[0]?.urgency ?? "low";

  // Apply conservative co-occurrence escalations.
  let escalated = false;
  for (const rule of ESCALATIONS) {
    const hasAll = rule.whenAll.every((id) => found.has(id));
    const hasAny = !rule.whenAny || rule.whenAny.some((id) => found.has(id));
    if (hasAll && hasAny && URGENCY_ORDER[rule.to] > URGENCY_ORDER[urgency]) {
      urgency = rule.to;
      escalated = true;
    }
  }

  return {
    urgency,
    version: TRIAGE_VERSION,
    symptom: signs[0]?.id ?? null,
    signs,
    escalated,
  };
}

/**
 * Back-compat shim for existing callers (e.g. the webhook) that expect the old
 * `{ urgency, symptom }` shape from analyzeSymptomRisk().
 */
export function analyzeSymptomRisk(message: string): {
  urgency: UrgencyLevel;
  symptom: string | null;
} {
  const result = assessTriage(message);
  return { urgency: result.urgency, symptom: result.symptom };
}
