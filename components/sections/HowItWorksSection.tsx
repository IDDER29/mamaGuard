import { Mic, BrainCircuit, BellRing, Users } from "lucide-react";

const STEPS = [
  {
    icon: Mic,
    title: "Mother Reports",
    body: "A voice message describing symptoms is sent simply via WhatsApp.",
  },
  {
    icon: BrainCircuit,
    title: "System Analyzes",
    body: "AI instantly processes the language and flags danger signs.",
  },
  {
    icon: BellRing,
    title: "Doctor Alerted",
    body: "Clinicians view priority cases on a real-time dashboard.",
  },
  {
    icon: Users,
    title: "Family Notified",
    body: "Automated guidance is sent to family and transport dispatched.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-slate-950"
    >
      <div
        className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-slate-900 dark:text-white text-balance">
            From a voice note to a saved life
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 text-pretty">
            Connecting rural mothers to life-saving care through simple voice
            technology — in four steps.
          </p>
        </header>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li
                key={title}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/80 dark:ring-white/10 shadow-lg flex items-center justify-center mb-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-primary/30">
                  <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-slate-950">
                    {i + 1}
                  </span>
                  <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[15rem]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
