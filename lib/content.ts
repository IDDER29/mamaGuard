// lib/content.ts
// Plan 2.3 — Educational content library (vetted).
// Plan E2.3 — multilingual: every tip/answer exists in Darija (default),
// French, and Modern Standard Arabic. The Darija text is the curated source;
// the French (fr) and Arabic (ar) strings are MACHINE-DRAFTED translations and
// SHOULD GET CLINICIAN REVIEW before being relied on in production.
// Two roles:
//   1. Grounds the LLM: buildGroundingBlock() injects relevant vetted content
//      into the Mama AI system prompt so answers stay accurate and on-message.
//   2. Powers the clinician-facing education browser (/dashboard/content).
// Content is curated and conservative; it never overrides clinical triage.

/** Supported content locales. Darija is the default. */
export type Locale = "darija" | "fr" | "ar";

/** Locale-keyed human text for a content entry. */
export interface LocalizedText {
  darija: string;
  fr: string;
  ar: string;
}

/**
 * Map a patient `language` string (e.g. "french", "arabic", "darija",
 * "fr", "ar", "msa") to a content Locale. Defaults to Darija.
 */
export function resolveLocale(language?: string | null): Locale {
  const key = (language ?? "").toLowerCase().trim();
  if (key.startsWith("fr")) return "fr";
  if (key === "arabic" || key === "msa" || key === "ar" || key.startsWith("ar")) return "ar";
  return "darija";
}

/** Pick the locale text, falling back to Darija when missing. */
export function pickText(text: LocalizedText, locale: Locale = "darija"): string {
  return text[locale] || text.darija;
}

export interface WeeklyGuidance {
  /** Inclusive gestational-week range this guidance applies to. */
  weeks: [number, number];
  trimester: 1 | 2 | 3;
  title: string;
  /** Locale-keyed guidance for the mother (Darija is the curated source). */
  tip: LocalizedText;
}

export interface KnowledgeEntry {
  id: string;
  category: "nutrition" | "symptoms" | "wellbeing" | "care" | "safety";
  /** Normalized keywords (Darija / French / English) used for matching. */
  keywords: string[];
  /** Locale-keyed short answer, grounded and conservative. */
  answer: LocalizedText;
}

// --- Week-by-week guidance ------------------------------------------------

export const WEEKLY_GUIDANCE: WeeklyGuidance[] = [
  {
    weeks: [1, 12],
    trimester: 1,
    title: "Trimester 1 — l-bidaya (1-12)",
    tip: {
      darija:
        "F l-osbou3at l-loula, khoudi 7amd l-folik (folic acid) kol nhar bach t7mi l-bebe. Ila 7ssiti b dwakha wla tqaylo s-sba7, kouli chwiya b chwiya w bzaf d l-ma. Bqay b3ida 3la t-tabgha w l-kohol.",
      fr: "Pendant les premières semaines, prenez de l'acide folique chaque jour pour protéger votre bébé. Si vous avez des nausées ou des vomissements le matin, mangez en petites quantités et buvez beaucoup d'eau. Évitez le tabac et l'alcool.",
      ar: "في الأسابيع الأولى، تناولي حمض الفوليك كل يوم لحماية جنينك. إذا شعرتِ بالغثيان أو التقيؤ في الصباح، فكلي كميات صغيرة وتدريجية واشربي الكثير من الماء. ابتعدي عن التدخين والكحول.",
    },
  },
  {
    weeks: [13, 27],
    trimester: 2,
    title: "Trimester 2 — l-wast (13-27)",
    tip: {
      darija:
        "Hada howa l-waqt li ghalban kat7ess fih b ra7a aktar. 7awli takli mlih (l-7did, l-calcium, l-khodra w l-fakya), w t-tmchay chwiya kol nhar. Mn b3d l-osbou3 20 ghadi t7ssi b 7arakat l-bebe — chi haja zwina!",
      fr: "C'est la période où vous vous sentez généralement plus à l'aise. Essayez de bien manger (fer, calcium, légumes et fruits) et de marcher un peu chaque jour. À partir de la 20e semaine, vous sentirez les mouvements du bébé — quelle belle chose !",
      ar: "هذه هي الفترة التي تشعرين فيها غالبًا براحة أكبر. حاولي أن تأكلي جيدًا (الحديد والكالسيوم والخضر والفواكه) وأن تمشي قليلًا كل يوم. ابتداءً من الأسبوع العشرين ستشعرين بحركات الجنين — وهو شيء جميل!",
    },
  },
  {
    weeks: [28, 40],
    trimester: 3,
    title: "Trimester 3 — l-akhir (28-40)",
    tip: {
      darija:
        "Qrebti! 7awli tr-ta7i bzaf w t-9ays 7arakat l-bebe kol nhar. Wajdi l-bag dyal sbitar. Ila 7ssiti b waja3 mountadim (contractions) li kayzid, wla nzif, wla l-ma nzlat — sir l sbitar daba.",
      fr: "Vous y êtes presque ! Essayez de bien vous reposer et de compter les mouvements du bébé chaque jour. Préparez votre sac pour l'hôpital. Si vous ressentez des contractions régulières qui s'intensifient, ou un saignement, ou une perte des eaux — allez à l'hôpital tout de suite.",
      ar: "اقتربتِ! حاولي أن ترتاحي كثيرًا وأن تحسبي حركات الجنين كل يوم. جهّزي حقيبة المستشفى. إذا شعرتِ بتقلصات منتظمة تزداد قوة، أو نزيف، أو نزول ماء الولادة — فاذهبي إلى المستشفى فورًا.",
    },
  },
];

export function getWeeklyGuidance(week: number | null | undefined): WeeklyGuidance | null {
  if (week == null || Number.isNaN(week)) return null;
  return WEEKLY_GUIDANCE.find((g) => week >= g.weeks[0] && week <= g.weeks[1]) ?? null;
}

// --- Postpartum guidance (Phase 3) ---------------------------------------

export interface PostpartumGuidance {
  title: string;
  tip: LocalizedText;
}

export const POSTPARTUM_GUIDANCE: PostpartumGuidance[] = [
  {
    title: "Ra7tk b3d l-wlada",
    tip: {
      darija:
        "Mbrouk 3la l-bebe! 🍼 Hadi merhala dyal l-tafaqi. R-ta7i waqt ma t-qderi, kouli mlih w chrbi l-ma bzaf, w khelli chi 7ed y3awnek f d-dar.",
      fr: "Félicitations pour le bébé ! 🍼 C'est une période de rétablissement. Reposez-vous dès que vous le pouvez, mangez bien, buvez beaucoup d'eau, et laissez quelqu'un vous aider à la maison.",
      ar: "مبروك على المولود! 🍼 هذه مرحلة التعافي. ارتاحي كلما استطعتِ، وكلي جيدًا واشربي الكثير من الماء، ودعي أحدًا يساعدك في البيت.",
    },
  },
  {
    title: "3alamat l-khatar b3d l-wlada",
    tip: {
      darija:
        "Sir l sbitar daba ila: nzif bzaf (kat3emri serviette f aqal mn sa3a), sxana, riha khayba mn l-ifrazat, wla wja3 qwi. Hadou 3alamat khatira khassek tchoufi tbiba.",
      fr: "Allez à l'hôpital tout de suite si : saignement abondant (vous remplissez une serviette en moins d'une heure), fièvre, mauvaise odeur des pertes, ou douleur intense. Ce sont des signes dangereux qui nécessitent de voir une médecin.",
      ar: "اذهبي إلى المستشفى فورًا إذا حدث: نزيف غزير (تملئين فوطة صحية في أقل من ساعة)، أو حمى، أو رائحة كريهة من الإفرازات، أو ألم شديد. هذه علامات خطيرة تستوجب زيارة الطبيبة.",
    },
  },
  {
    title: "S-saht n-nafsiya",
    tip: {
      darija:
        "Ila 7ssiti b 7ozn dayem, kat-bki bzaf, wla ma 3andekch far7a m3a l-bebe — hada momkin ykoun depression d b3d l-wlada. Machi 3iben, w kayn 3ilaj. Hdri m3a tbiba.",
      fr: "Si vous ressentez une tristesse persistante, pleurez beaucoup, ou n'éprouvez pas de joie avec le bébé — cela peut être une dépression post-partum. Ce n'est pas une honte, et il existe un traitement. Parlez-en à une médecin.",
      ar: "إذا شعرتِ بحزن دائم، أو بكيتِ كثيرًا، أو لم تشعري بالفرح مع مولودك — فقد يكون هذا اكتئاب ما بعد الولادة. ليس عيبًا، وهناك علاج له. تحدّثي مع الطبيبة.",
    },
  },
];

export function getPostpartumGuidance(): PostpartumGuidance {
  // Lead with the safety block — it's the highest-value reminder postpartum.
  return POSTPARTUM_GUIDANCE[1];
}

// --- Topical knowledge base ----------------------------------------------

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "folic-acid",
    category: "nutrition",
    keywords: ["folic", "folik", "7amd", "fitamin", "vitamine", "vitamin", "supplement", "dwa dyal l7aml"],
    answer: {
      darija:
        "7amd l-folik (folic acid) mohim bzaf f l-bidaya bach l-bebe ykbar mlih. Khoudih kol nhar 7it l-tabiba goltlek tw9fi. Zid 3lih l-7did (fer) ila l-tabiba wsfatou lik.",
      fr: "L'acide folique est très important au début pour que le bébé grandisse bien. Prenez-le chaque jour jusqu'à ce que la médecin vous dise d'arrêter. Ajoutez-y le fer si la médecin vous l'a prescrit.",
      ar: "حمض الفوليك مهم جدًا في البداية حتى ينمو الجنين جيدًا. تناوليه كل يوم إلى أن تطلب منكِ الطبيبة التوقف. أضيفي إليه الحديد إذا وصفته لكِ الطبيبة.",
    },
  },
  {
    id: "nausea",
    category: "symptoms",
    keywords: ["dwakha", "tqayye", "tqaylo", "ghatian", "nausee", "nausea", "vomir", "kanqayye", "ma kanaklch"],
    answer: {
      darija:
        "Dwakha w t-tqayye 3adyin f l-trimester l-lowel. Kouli wajbat sghar w mtafarrqin, bzaf d l-ma, w b3di 3la l-rwa7 l-qwiya. Ila ma qderti takli wala tchrbi walou wla kat-tqayye bzaf, goli l-tabiba.",
      fr: "Les nausées et les vomissements sont normaux au premier trimestre. Mangez de petits repas répartis dans la journée, buvez beaucoup d'eau, et évitez les odeurs fortes. Si vous ne pouvez plus rien manger ni boire, ou si vous vomissez beaucoup, dites-le à la médecin.",
      ar: "الغثيان والتقيؤ أمران طبيعيان في الثلث الأول من الحمل. كلي وجبات صغيرة وموزّعة على اليوم، واشربي الكثير من الماء، وابتعدي عن الروائح القوية. إذا لم تستطيعي أن تأكلي أو تشربي شيئًا، أو كنتِ تتقيّئين كثيرًا، فأخبري الطبيبة.",
    },
  },
  {
    id: "nutrition",
    category: "nutrition",
    keywords: ["makla", "takol", "nakol", "ghida", "nutrition", "manger", "regime", "wzn", "calcium", "7did", "fer"],
    answer: {
      darija:
        "7awli takli mwazan: l-khodra, l-fakya, l-protine (l-7out, l-bid, l-3ds), w l-7lib bach tjib l-calcium. B3di 3la l-makla l-nya wla li ma t-tabkhatch mlih. Chrbi l-ma bzaf.",
      fr: "Essayez de manger équilibré : légumes, fruits, protéines (poisson, œufs, lentilles), et lait pour le calcium. Évitez les aliments crus ou mal cuits. Buvez beaucoup d'eau.",
      ar: "حاولي أن تأكلي بشكل متوازن: الخضر والفواكه والبروتينات (السمك والبيض والعدس)، والحليب للحصول على الكالسيوم. ابتعدي عن الأطعمة النيئة أو غير المطهوّة جيدًا. اشربي الكثير من الماء.",
    },
  },
  {
    id: "sleep-rest",
    category: "wellbeing",
    keywords: ["n3as", "norqud", "ra7a", "3ya", "fatigue", "sommeil", "dormir", "ta3b", "mte3b"],
    answer: {
      darija:
        "L-3ya 3adi f l-7aml. 7awli tr-ta7i waqt ma t-qderi, w n3si 3la l-jiha l-lisr (left side) f l-akhir bach d-dem ywsl mlih l-bebe.",
      fr: "La fatigue est normale pendant la grossesse. Essayez de vous reposer dès que vous le pouvez, et dormez sur le côté gauche en fin de grossesse pour que le sang parvienne bien au bébé.",
      ar: "التعب أمر طبيعي أثناء الحمل. حاولي أن ترتاحي كلما استطعتِ، ونامي على الجانب الأيسر في أواخر الحمل حتى يصل الدم جيدًا إلى الجنين.",
    },
  },
  {
    id: "exercise",
    category: "wellbeing",
    keywords: ["riyada", "tmchay", "sport", "exercice", "marche", "7arka", "noni"],
    answer: {
      darija:
        "T-tmchay l-khfif w l-7arka l-haniya zwinin f l-7aml ila l-tabiba ma man3atch. B3di 3la l-haja l-q7ba wla li fiha khatar dyal l-9i3a.",
      fr: "La marche légère et l'activité douce sont bénéfiques pendant la grossesse, sauf si la médecin vous l'a déconseillé. Évitez les efforts intenses ou les activités à risque de chute.",
      ar: "المشي الخفيف والحركة الهادئة مفيدان أثناء الحمل ما لم تمنعك الطبيبة. ابتعدي عن المجهود الشاق أو الأنشطة التي فيها خطر السقوط.",
    },
  },
  {
    id: "anc-visits",
    category: "care",
    keywords: ["maw3id", "rendez", "visite", "tabiba", "qabla", "fa7s", "consultation", "controle", "mraqaba"],
    answer: {
      darija:
        "Mohim t-mchi l-maw3id dyal l-mraqaba (ANC) kima goltlek l-tabiba. Hadik l-fa7s kat-tt'akkd belli nti w l-bebe b-khir w kat-l9a l-mochkil bekri.",
      fr: "Il est important d'aller aux rendez-vous de suivi prénatal (CPN) comme vous l'a dit la médecin. Ces examens permettent de confirmer que vous et le bébé allez bien et de détecter tout problème tôt.",
      ar: "من المهم أن تذهبي إلى مواعيد المتابعة (فحوصات الحمل) كما أخبرتك الطبيبة. هذه الفحوصات تؤكد أنكِ والجنين بخير وتكشف أي مشكلة مبكرًا.",
    },
  },
  {
    id: "breastfeeding",
    category: "care",
    keywords: ["rda3a", "7lib", "allaitement", "breastfeed", "sdr", "nrdde3"],
    answer: {
      darija:
        "L-rda3a tabi3iya zwina l-saht l-bebe w dyalk. Ila bghiti t-staqsi 3la kifach t-wajdi raskk, goliha liya wla saqsi l-qabla.",
      fr: "L'allaitement est naturel et bénéfique pour la santé du bébé et la vôtre. Si vous voulez vous renseigner sur comment vous y préparer, dites-le-moi ou demandez à la sage-femme.",
      ar: "الرضاعة الطبيعية أمر طبيعي ومفيد لصحة الجنين وصحتك. إذا أردتِ أن تستفسري عن كيفية الاستعداد لها، فأخبريني أو اسألي القابلة.",
    },
  },
  {
    id: "mental-health",
    category: "wellbeing",
    keywords: ["7zn", "qlq", "stress", "khayfa", "deprime", "anxiete", "ma3andich frar7a", "kan3it", "we7da"],
    answer: {
      darija:
        "L-m3anat n-nafsiya f l-7aml machi 3iben — bzaf d l-3yalat kayhssou b l-qlq wla l-7zn. Hdri m3a chi 7ed kat-tiq fih, w ila l-7ssas bqa mddat twila goli l-tabiba bach t3awnk.",
      fr: "La souffrance psychologique pendant la grossesse n'est pas une honte — beaucoup de femmes ressentent de l'anxiété ou de la tristesse. Parlez-en à quelqu'un de confiance, et si ce ressenti dure longtemps, dites-le à la médecin pour qu'elle vous aide.",
      ar: "المعاناة النفسية أثناء الحمل ليست عيبًا — كثير من النساء يشعرن بالقلق أو الحزن. تحدّثي مع شخص تثقين به، وإذا استمر هذا الشعور مدة طويلة فأخبري الطبيبة لتساعدك.",
    },
  },
  {
    id: "postpartum-bleeding",
    category: "safety",
    keywords: ["nzif b3d", "dem b3d l-wlada", "lochies", "ifrazat", "saignement apres"],
    answer: {
      darija:
        "N-nzif l-khafif b3d l-wlada 3adi w kayn7l m3a l-iyyam. Walakin ila kan bzaf (kat3emri serviette f aqal mn sa3a) wla fih riha khayba wla sxana — sir l sbitar daba.",
      fr: "Un léger saignement après l'accouchement est normal et diminue avec les jours. Mais s'il est abondant (vous remplissez une serviette en moins d'une heure), ou s'il a une mauvaise odeur, ou en cas de fièvre — allez à l'hôpital tout de suite.",
      ar: "النزيف الخفيف بعد الولادة أمر طبيعي ويخف مع مرور الأيام. لكن إذا كان غزيرًا (تملئين فوطة صحية في أقل من ساعة)، أو كانت له رائحة كريهة، أو ظهرت حمى — فاذهبي إلى المستشفى فورًا.",
    },
  },
  {
    id: "newborn-care",
    category: "care",
    keywords: ["bebe", "rdde3", "noni d l-bebe", "sorra", "nouveau ne", "newborn"],
    answer: {
      darija:
        "Rdde3i l-bebe kol ma 7taj (8-12 mrra f nhar). 7afdi 3la d-dafa dyalou w nadafat s-sorra. Ila l-bebe ma kayrdde3ch, kaybqa b7al l-asfar, wla 3andou sxana — chouf t-tbiba.",
      fr: "Allaitez le bébé chaque fois qu'il en a besoin (8 à 12 fois par jour). Gardez-le au chaud et maintenez le cordon ombilical propre. Si le bébé ne tète pas, reste jaune, ou a de la fièvre — consultez la médecin.",
      ar: "أرضعي مولودك كلما احتاج (من 8 إلى 12 مرة في اليوم). حافظي على دفئه ونظافة السرّة. إذا كان المولود لا يرضع، أو بقي مصفرّ اللون، أو أصيب بحمى — فراجعي الطبيبة.",
    },
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
 * Keyword matching always runs against the Darija/Fr/En keywords; only the
 * rendered text is localized via `opts.language` (default Darija).
 * Returns "" when nothing relevant is found.
 */
export function buildGroundingBlock(
  message: string,
  week: number | null | undefined,
  opts?: { postpartum?: boolean; language?: string },
): string {
  const locale = resolveLocale(opts?.language);
  const lines: string[] = [];
  if (opts?.postpartum) {
    const pp = getPostpartumGuidance();
    lines.push(`- (${pp.title}) ${pickText(pp.tip, locale)}`);
  } else {
    const guidance = getWeeklyGuidance(week);
    if (guidance) lines.push(`- (${guidance.title}) ${pickText(guidance.tip, locale)}`);
  }
  for (const entry of findKnowledge(message)) lines.push(`- ${pickText(entry.answer, locale)}`);
  return lines.join("\n");
}
