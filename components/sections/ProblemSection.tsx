import { GraduationCap, Footprints, EyeOff } from "lucide-react";

const PROBLEMS = [
  {
    icon: GraduationCap,
    title: "Knowledge Gap",
    body: "Expectant mothers often lack awareness of critical danger signs, delaying the decision to seek help until it's too late.",
  },
  {
    icon: Footprints,
    title: "Distance Gap",
    body: "Physical distance from clinics prevents frequent check-ups, leaving long periods of pregnancy completely unmonitored.",
  },
  {
    icon: EyeOff,
    title: "Doctor Blindness",
    body: "Without real-time data between visits, doctors are reactive rather than proactive, often missing early warning signals.",
  },
];

export default function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative py-20 sm:py-28 bg-slate-50 dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-block text-primary font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3">
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-slate-900 dark:text-white text-balance">
            Why current care falls short
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 text-pretty">
            Millions of women in rural areas face preventable complications due
            to systemic gaps in the healthcare delivery model.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {PROBLEMS.map(({ icon: Icon, title, body }, i) => (
            <article
              key={title}
              className={`group rounded-2xl bg-white dark:bg-slate-950/40 p-7 sm:p-8 ring-1 ring-slate-200/70 dark:ring-white/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                i === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-cyan-300/10 flex items-center justify-center text-primary mb-5 sm:mb-6 ring-1 ring-primary/10 group-hover:scale-105 transition-transform duration-300">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2.5">
                {title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
