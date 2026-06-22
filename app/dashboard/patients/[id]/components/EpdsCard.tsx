"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Loader2, Plus, X } from "lucide-react";
import { createEpdsScreening, type EpdsScreeningRow } from "@/app/actions/epds";

// Edinburgh Postnatal Depression Scale — 10 items. Options are listed in
// increasing-severity order, so the option index IS the score (0–3). This
// already accounts for the instrument's reverse-scored items.
const EPDS_QUESTIONS: { q: string; options: [string, string, string, string] }[] = [
  { q: "I have been able to laugh and see the funny side of things", options: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"] },
  { q: "I have looked forward with enjoyment to things", options: ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"] },
  { q: "I have blamed myself unnecessarily when things went wrong", options: ["No, never", "Not very often", "Yes, some of the time", "Yes, most of the time"] },
  { q: "I have been anxious or worried for no good reason", options: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"] },
  { q: "I have felt scared or panicky for no very good reason", options: ["No, not at all", "No, not much", "Yes, sometimes", "Yes, quite a lot"] },
  { q: "Things have been getting on top of me", options: ["No, coping as well as ever", "Most of the time I cope well", "Sometimes not coping as well", "Most of the time not coping"] },
  { q: "I have been so unhappy that I have had difficulty sleeping", options: ["No, not at all", "Not very often", "Yes, sometimes", "Yes, most of the time"] },
  { q: "I have felt sad or miserable", options: ["No, not at all", "Not very often", "Yes, quite often", "Yes, most of the time"] },
  { q: "I have been so unhappy that I have been crying", options: ["No, never", "Only occasionally", "Yes, quite often", "Yes, most of the time"] },
  { q: "The thought of harming myself has occurred to me", options: ["Never", "Hardly ever", "Sometimes", "Yes, quite often"] },
];

interface EpdsCardProps {
  patientId: string;
  screenings: EpdsScreeningRow[];
}

export function EpdsCard({ patientId, screenings }: EpdsCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [saving, setSaving] = useState(false);

  const total = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0);
  const allAnswered = answers.every((a) => a !== null);

  const reset = useCallback(() => {
    setAnswers(Array(10).fill(null));
    setOpen(false);
  }, []);

  // a11y (Plan E3.3): Escape closes the modal; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, reset]);

  const handleSubmit = useCallback(async () => {
    if (!allAnswered || saving) return;
    setSaving(true);
    const res = await createEpdsScreening({ patientId, answers: answers as number[] });
    setSaving(false);
    if (res.success) {
      reset();
      router.refresh();
    } else {
      alert(res.error || "Failed to save screening");
    }
  }, [allAnswered, saving, patientId, answers, reset, router]);

  return (
    <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Brain className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-sm font-semibold text-slate-800">EPDS Screening</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>
      <div className="p-4 space-y-2">
        {screenings.length === 0 ? (
          <p className="text-xs text-slate-500">No screenings recorded.</p>
        ) : (
          <ul className="space-y-2">
            {screenings.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-slate-700">
                  {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{s.total_score}/30</span>
                  {s.risk_flag && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.q10_score > 0 ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}>
                      {s.q10_score > 0 ? "Urgent" : "At risk"}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edinburgh Postnatal Depression Scale"
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Edinburgh Postnatal Depression Scale</h3>
              <button onClick={reset} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-5">
              {EPDS_QUESTIONS.map((item, qi) => (
                <fieldset key={qi}>
                  <legend className="text-sm font-medium text-slate-800 mb-2">
                    {qi + 1}. {item.q}
                  </legend>
                  <div className="space-y-1">
                    {item.options.map((opt, score) => (
                      <label key={score} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name={`epds-${qi}`}
                          checked={answers[qi] === score}
                          onChange={() =>
                            setAnswers((prev) => {
                              const next = [...prev];
                              next[qi] = score;
                              return next;
                            })
                          }
                          className="h-4 w-4 text-primary focus:ring-primary/30"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600">
                Score: <span className="font-bold text-slate-900">{total}/30</span>
                {total >= 10 && <span className="ml-2 text-orange-600 font-medium">at-risk threshold</span>}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!allAnswered || saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white text-sm font-medium px-4 py-2 hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save screening
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
