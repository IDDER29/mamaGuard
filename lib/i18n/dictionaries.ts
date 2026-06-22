// Plan E3.4 — lightweight, dependency-free i18n dictionaries for the clinician
// dashboard chrome (nav + common UI strings). No next-intl / routing changes.
// Translations cover the sidebar and mobile bottom-nav labels. Any string not
// present here falls back to the key itself (see useT()).

export type UiLocale = "en" | "fr" | "ar";

export const UI_LOCALES: readonly UiLocale[] = ["en", "fr", "ar"] as const;

/** Maps an arbitrary stored `ui_language` value onto a supported UiLocale. */
export function toUiLocale(value: string | null | undefined): UiLocale {
  const v = (value ?? "").toLowerCase().slice(0, 2);
  return v === "fr" || v === "ar" ? v : "en";
}

/**
 * Translation tables keyed by the canonical English label so existing nav code
 * can pass its current strings straight through `t(...)`.
 */
export const DICT: Record<UiLocale, Record<string, string>> = {
  en: {
    "Triage Board": "Triage Board",
    "Triage Queue": "Triage Queue",
    Queue: "Queue",
    Worklist: "Worklist",
    "All Patients": "All Patients",
    Patients: "Patients",
    Education: "Education",
    Analytics: "Analytics",
    Team: "Team",
    Admin: "Admin",
    Settings: "Settings",
    Messages: "Messages",
    Protocols: "Protocols",
    "Quick Access": "Quick Access",
  },
  fr: {
    "Triage Board": "Tableau de triage",
    "Triage Queue": "File de triage",
    Queue: "File",
    Worklist: "Liste de travail",
    "All Patients": "Tous les patients",
    Patients: "Patients",
    Education: "Éducation",
    Analytics: "Analytique",
    Team: "Équipe",
    Admin: "Administration",
    Settings: "Paramètres",
    Messages: "Messages",
    Protocols: "Protocoles",
    "Quick Access": "Accès rapide",
  },
  ar: {
    "Triage Board": "لوحة الفرز",
    "Triage Queue": "قائمة الفرز",
    Queue: "القائمة",
    Worklist: "قائمة المهام",
    "All Patients": "جميع المرضى",
    Patients: "المرضى",
    Education: "التثقيف",
    Analytics: "التحليلات",
    Team: "الفريق",
    Admin: "الإدارة",
    Settings: "الإعدادات",
    Messages: "الرسائل",
    Protocols: "البروتوكولات",
    "Quick Access": "وصول سريع",
  },
};
