// lib/conversation.ts
// Plan E2.1/E2.2/E6.1 — inbound message intent parser for the WhatsApp/SMS
// conversation. Deterministic and dependency-free so it can be unit-tested
// directly (lib/conversation.test.mjs). Command intents (stop/help/language)
// only fire on SHORT messages so they never suppress a real symptom report
// like "stop the bleeding won't stop".

export type ConversationLanguage =
  | "darija"
  | "arabic"
  | "french"
  | "amazigh"
  | "english";

export type Intent =
  | { kind: "stop" }
  | { kind: "help" }
  | { kind: "language"; language: ConversationLanguage }
  | { kind: "message" }; // default → triage + LLM

const COMMAND_MAX_LEN = 24; // commands are short; longer text is a real message

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ْـ]/g, "") // arabic diacritics + tatweel
    .trim();
}

const STOP_WORDS = ["stop", "unsubscribe", "arret", "w9f", "wqf", "حيد", "وقف", "بلوكي", "كفا"];
const HELP_WORDS = ["help", "aide", "musa3ada", "mosa3ada", "مساعدة", "?", "؟", "menu"];

const LANGUAGE_WORDS: { match: string[]; language: ConversationLanguage }[] = [
  { match: ["french", "francais", "français", "lang fr", "fr"], language: "french" },
  { match: ["english", "anglais", "lang en", "en"], language: "english" },
  { match: ["amazigh", "tamazight", "tachelhit", "tarifit"], language: "amazigh" },
  { match: ["arabic", "fusha", "msa", "lang ar"], language: "arabic" },
  { match: ["darija", "darja"], language: "darija" },
];

function hasWord(haystack: string, word: string): boolean {
  const w = normalize(word);
  if (!w) return false;
  // word-boundary-ish: match as a token to avoid "en" matching inside words.
  return new RegExp(`(^|[^a-z0-9\\u0600-\\u06ff])${escapeRe(w)}([^a-z0-9\\u0600-\\u06ff]|$)`).test(
    ` ${haystack} `,
  );
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Parse an inbound message into a command intent (or a plain message). */
export function parseIntent(text: string): Intent {
  const n = normalize(text);
  const isShort = n.length <= COMMAND_MAX_LEN;

  if (isShort && STOP_WORDS.some((w) => hasWord(n, w))) return { kind: "stop" };
  if (isShort && HELP_WORDS.some((w) => hasWord(n, w))) return { kind: "help" };
  if (isShort) {
    for (const { match, language } of LANGUAGE_WORDS) {
      if (match.some((w) => hasWord(n, w))) return { kind: "language", language };
    }
  }
  return { kind: "message" };
}

// --- Outbound copy (Darija defaults; keep warm + clear) -------------------

export function helpMessage(): string {
  return (
    "Ana Mama AI 🧸, l-moussa3ida dyalk f l-7aml. Kifach n3awnek:\n" +
    "• Goli liya kifach 7assa wla 3andek chi su'al — ktbi wla sift sawt 🎙️.\n" +
    "• Ila 3andek maw3id, jaweb 'wakha' bach t'akkdi wla 'bdel' bach n-bedloh.\n" +
    "• Bedel l-lo3a: ktbi FR (français), EN (english), wla AR (3arabiya).\n" +
    "• Bach t-w9fi r-rasa'il: ktbi STOP.\n\n" +
    "⚠️ Ana machi 3iwad 3la tbib. Ila 7assiti b chi 3arad khatir, sir l aqrab sbitar daba."
  );
}

export function stopConfirmMessage(): string {
  return "W9efna r-rasa'il l-otomatikiya. Ila bghiti ترجعي, ktbi 'START' f ay waqt. 7afdi 3la ras-ek 🧸.";
}

export function languageConfirmMessage(language: ConversationLanguage): string {
  switch (language) {
    case "french":
      return "✅ D'accord, je te répondrai désormais en français. Comment puis-je t'aider ?";
    case "english":
      return "✅ Done — I'll reply in English from now on. How can I help you?";
    case "arabic":
      return "✅ تمام، غادي نجاوبك بالعربية الفصحى من دابا. كيفاش نقدر نعاونك؟";
    case "amazigh":
      return "✅ Waxxa, ad ak-ssiwleɣ s Tmaziɣt. Mamec zemreɣ ad cek-âawneɣ?";
    default:
      return "✅ Wakha, ghadi njaweb b d-darija. Kifach n3awnek?";
  }
}
