import { AudioLines, Activity, LayoutDashboard, Users, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: AudioLines,
    title: "Voice Check-ins",
    body: "Automated WhatsApp voice surveys in local dialects let mothers report symptoms easily — no typing required.",
    tint: "from-teal-500/15 to-teal-400/5 text-teal-600 dark:text-teal-400 ring-teal-500/10",
  },
  {
    icon: Activity,
    title: "Risk Detection",
    body: "AI analyzes every response to triage patients instantly, flagging high-risk cases for immediate attention.",
    tint: "from-blue-500/15 to-blue-400/5 text-blue-600 dark:text-blue-400 ring-blue-500/10",
  },
  {
    icon: LayoutDashboard,
    title: "Doctor Dashboard",
    body: "Clinicians get a prioritized patient list with longitudinal health trends to make informed decisions fast.",
    tint: "from-indigo-500/15 to-indigo-400/5 text-indigo-600 dark:text-indigo-400 ring-indigo-500/10",
  },
  {
    icon: Users,
    title: "Family Engagement",
    body: "Keeps partners and family informed with automated updates and educational tips to support the mother.",
    tint: "from-pink-500/15 to-pink-400/5 text-pink-600 dark:text-pink-400 ring-pink-500/10",
  },
];

export default function SolutionSection() {
  return (
    <section
      id="solution"
      className="relative py-20 sm:py-28 bg-white dark:bg-slate-950 overflow-hidden"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-14 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block text-primary font-semibold tracking-wider uppercase text-xs sm:text-sm mb-3">
              Our Solution
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-slate-900 dark:text-white text-balance">
              The MamaGuard ecosystem
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto md:mx-0 text-pretty">
              A comprehensive platform connecting the dots in maternal
              healthcare through accessible, voice-first technology.
            </p>
          </div>
          <a
            href="#how-it-works"
            className="hidden md:inline-flex shrink-0 items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
          >
            Learn about our technology
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {FEATURES.map(({ icon: Icon, title, body, tint }) => (
            <article
              key={title}
              className="group rounded-2xl bg-white dark:bg-slate-900 p-6 ring-1 ring-slate-200/70 dark:ring-white/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tint} ring-1 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
          >
            Learn about our technology
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
