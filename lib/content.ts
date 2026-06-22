// lib/content.ts
// Plan 2.3 — Educational content library (vetted, Darija/Latin-script).
// Two roles:
//   1. Grounds the LLM: buildGroundingBlock() injects relevant vetted content
//      into the Mama AI system prompt so answers stay accurate and on-message.
//   2. Powers the clinician-facing education browser (/dashboard/content).
// Content is curated and conservative; it never overrides clinical triage.

export interface WeeklyGuidance {
  /** Inclusive gestational-week range this guidance applies to. */
  weeks: [number, number];
  trimester: 1 | 2 | 3;
  title: string;
  /** Darija (Latin-script) guidance for the mother. */
  tip: string;
}

export interface KnowledgeEntry {
  id: string;
  category: "nutrition" | "symptoms" | "wellbeing" | "care" | "safety";
  /** Normalized keywords (Darija / French / English) used for matching. */
  keywords: string[];
  /** Short Darija (Latin-script) answer, grounded and conservative. */
  answer: string;
}

// --- Week-by-week guidance ------------------------------------------------

export const WEEKLY_GUIDANCE: WeeklyGuidance[] = [
  {
    weeks: [1, 12],
    trimester: 1,
    title: "Trimester 1 — l-bidaya (1-12)",
    tip: "F l-osbou3at l-loula, khoudi 7amd l-folik (folic acid) kol nhar bach t7mi l-bebe. Ila 7ssiti b dwakha wla tqaylo s-sba7, kouli chwiya b chwiya w bzaf d l-ma. Bqay b3ida 3la t-tabgha w l-kohol.",
  },
  {
    weeks: [13, 27],
    trimester: 2,
    title: "Trimester 2 — l-wast (13-27)",
    tip: "Hada howa l-waqt li ghalban kat7ess fih b ra7a aktar. 7awli takli mlih (l-7did, l-calcium, l-khodra w l-fakya), w t-tmchay chwiya kol nhar. Mn b3d l-osbou3 20 ghadi t7ssi b 7arakat l-bebe — chi haja zwina!",
  },
  {
    weeks: [28, 40],
    trimester: 3,
    title: "Trimester 3 — l-akhir (28-40)",
    tip: "Qrebti! 7awli tr-ta7i bzaf w t-9ays 7arakat l-bebe kol nhar. Wajdi l-bag dyal sbitar. Ila 7ssiti b waja3 mountadim (contractions) li kayzid, wla nzif, wla l-ma nzlat — sir l sbitar daba.",
  },
];

export function getWeeklyGuidance(week: number | null | undefined): WeeklyGuidance | null {
  if (week == null || Number.isNaN(week)) return null;
  return WEEKLY_GUIDANCE.find((g) => week >= g.weeks[0] && week <= g.weeks[1]) ?? null;
}

// --- Topical knowledge base ----------------------------------------------

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "folic-acid",
    category: "nutrition",
    keywords: ["folic", "folik", "7amd", "fitamin", "vitamine", "vitamin", "supplement", "dwa dyal l7aml"],
    answer:
      "7amd l-folik (folic acid) mohim bzaf f l-bidaya bach l-bebe ykbar mlih. Khoudih kol nhar 7it l-tabiba goltlek tw9fi. Zid 3lih l-7did (fer) ila l-tabiba wsfatou lik.",
  },
  {
    id: "nausea",
    category: "symptoms",
    keywords: ["dwakha", "tqayye", "tqaylo", "ghatian", "nausee", "nausea", "vomir", "kanqayye", "ma kanaklch"],
    answer:
      "Dwakha w t-tqayye 3adyin f l-trimester l-lowel. Kouli wajbat sghar w mtafarrqin, bzaf d l-ma, w b3di 3la l-rwa7 l-qwiya. Ila ma qderti takli wala tchrbi walou wla kat-tqayye bzaf, goli l-tabiba.",
  },
  {
    id: "nutrition",
    category: "nutrition",
    keywords: ["makla", "takol", "nakol", "ghida", "nutrition", "manger", "regime", "wzn", "calcium", "7did", "fer"],
    answer:
      "7awli takli mwazan: l-khodra, l-fakya, l-protine (l-7out, l-bid, l-3ds), w l-7lib bach tjib l-calcium. B3di 3la l-makla l-nya wla li ma t-tabkhatch mlih. Chrbi l-ma bzaf.",
  },
  {
    id: "sleep-rest",
    category: "wellbeing",
    keywords: ["n3as", "norqud", "ra7a", "3ya", "fatigue", "sommeil", "dormir", "ta3b", "mte3b"],
    answer:
      "L-3ya 3adi f l-7aml. 7awli tr-ta7i waqt ma t-qderi, w n3si 3la l-jiha l-lisr (left side) f l-akhir bach d-dem ywsl mlih l-bebe.",
  },
  {
    id: "exercise",
    category: "wellbeing",
    keywords: ["riyada", "tmchay", "sport", "exercice", "marche", "7arka", "noni"],
    answer:
      "T-tmchay l-khfif w l-7arka l-haniya zwinin f l-7aml ila l-tabiba ma man3atch. B3di 3la l-haja l-q7ba wla li fiha khatar dyal l-9i3a.",
  },
  {
    id: "anc-visits",
    category: "care",
    keywords: ["maw3id", "rendez", "visite", "tabiba", "qabla", "fa7s", "consultation", "controle", "mraqaba"],
    answer:
      "Mohim t-mchi l-maw3id dyal l-mraqaba (ANC) kima goltlek l-tabiba. Hadik l-fa7s kat-tt'akkd belli nti w l-bebe b-khir w kat-l9a l-mochkil bekri.",
  },
  {
    id: "breastfeeding",
    category: "care",
    keywords: ["rda3a", "7lib", "allaitement", "breastfeed", "sdr", "nrdde3"],
    answer:
      "L-rda3a tabi3iya zwina l-saht l-bebe w dyalk. Ila bghiti t-staqsi 3la kifach t-wajdi raskk, goliha liya wla saqsi l-qabla.",
  },
  {
    id: "mental-health",
    category: "wellbeing",
    keywords: ["7zn", "qlq", "stress", "khayfa", "deprime", "anxiete", "ma3andich frar7a", "kan3it", "we7da"],
    answer:
      "L-m3anat n-nafsiya f l-7aml machi 3iben — bzaf d l-3yalat kayhssou b l-qlq wla l-7zn. Hdri m3a chi 7ed kat-tiq fih, w ila l-7ssas bqa mddat twila goli l-tabiba bach t3awnk.",
  },
];

// --- Matching + grounding -------------------------------------------------

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[إأآا]/g, "ا");
}

/** Knowledge entries whose keywords appear in the patient message. */
export function findKnowledge(message: string, limit = 2): KnowledgeEntry[] {
  const hay = normalize(message);
  const matches = KNOWLEDGE_BASE.filter((e) =>
    e.keywords.some((k) => hay.includes(normalize(k))),
  );
  return matches.slice(0, limit);
}

/**
 * Build a grounding block for the LLM system prompt from vetted content:
 * the week-appropriate guidance plus any topic matched in the message.
 * Returns "" when nothing relevant is found.
 */
export function buildGroundingBlock(
  message: string,
  week: number | null | undefined,
): string {
  const lines: string[] = [];
  const guidance = getWeeklyGuidance(week);
  if (guidance) lines.push(`- (${guidance.title}) ${guidance.tip}`);
  for (const entry of findKnowledge(message)) lines.push(`- ${entry.answer}`);
  return lines.join("\n");
}
