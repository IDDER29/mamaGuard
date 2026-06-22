"use client";

import { useState } from "react";
import { BookOpen, Apple, Activity, HeartPulse, Stethoscope, ShieldAlert, Baby } from "lucide-react";
import {
  WEEKLY_GUIDANCE,
  KNOWLEDGE_BASE,
  POSTPARTUM_GUIDANCE,
  pickText,
  type KnowledgeEntry,
  type Locale,
} from "@/lib/content";

// Plan 2.3 — clinician reference view of the vetted education library that
// also grounds Mama AI's replies. Read-only; content lives in lib/content.ts.
// Plan E2.3 — multilingual: a simple locale toggle renders Darija (default),
// French, or Modern Standard Arabic. French/Arabic strings are machine-drafted
// and should get clinician review.

const CATEGORY_META: Record<KnowledgeEntry["category"], { label: string; Icon: typeof Apple; chip: string }> = {
  nutrition: { label: "Nutrition", Icon: Apple, chip: "bg-emerald-50 text-emerald-700" },
  symptoms: { label: "Symptoms", Icon: Activity, chip: "bg-amber-50 text-amber-700" },
  wellbeing: { label: "Well-being", Icon: HeartPulse, chip: "bg-rose-50 text-rose-700" },
  care: { label: "Care", Icon: Stethoscope, chip: "bg-sky-50 text-sky-700" },
  safety: { label: "Safety", Icon: ShieldAlert, chip: "bg-orange-50 text-orange-700" },
};

const TRIMESTER_TINT = ["from-sky-50", "from-violet-50", "from-rose-50"] as const;

const LOCALES: { value: Locale; label: string }[] = [
  { value: "darija", label: "Darija" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

export default function ContentLibraryPage() {
  const [locale, setLocale] = useState<Locale>("darija");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-[1100px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              Education Library
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Vetted guidance that grounds Mama AI&apos;s replies and proactive check-ins.
              <span className="block text-[11px] text-slate-400 mt-0.5">
                French &amp; Arabic are machine-drafted — pending clinician review.
              </span>
            </p>
          </div>
          <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-slate-200 shadow-sm">
            {LOCALES.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLocale(l.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  locale === l.value ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Week-by-week guidance */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Week-by-week guidance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEEKLY_GUIDANCE.map((g) => (
              <div
                key={g.title}
                className={`rounded-2xl bg-gradient-to-b ${TRIMESTER_TINT[g.trimester - 1]} to-white p-5 ring-1 ring-slate-200/70 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/70 text-slate-700 ring-1 ring-slate-200">
                    Weeks {g.weeks[0]}–{g.weeks[1]}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">T{g.trimester}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{g.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed" dir="auto">
                  {pickText(g.tip, locale)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Postpartum guidance (Phase 3) */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Baby className="h-4 w-4" /> Postpartum guidance
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {POSTPARTUM_GUIDANCE.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl bg-gradient-to-b from-violet-50 to-white p-5 ring-1 ring-slate-200/70 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900 mb-1.5">{g.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed" dir="auto">
                  {pickText(g.tip, locale)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Topical knowledge base */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Topics ({KNOWLEDGE_BASE.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {KNOWLEDGE_BASE.map((e) => {
              const meta = CATEGORY_META[e.category];
              return (
                <div key={e.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.chip}`}>
                      <meta.Icon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed" dir="auto">
                    {pickText(e.answer, locale)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Triggers: {e.keywords.slice(0, 5).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
