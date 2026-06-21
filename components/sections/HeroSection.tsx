import Image from "next/image";
import {
  ArrowRight,
  PlayCircle,
  Star,
  AlertCircle,
  HeartPulse,
  ShieldCheck,
  Languages,
} from "lucide-react";

const TRUST_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDUwQUfdZeJDrmZtLQhKwNt9LpB18GBLqbTwjKIimAj90WK9_Ab2IOsXS5S2BrkhmR0WHKA-gUMMNQWMUXbCZcTWR1S1WYdo8uLTQce2uXN-5SZ437MO7Ftrqf5ccBKNEwlrTQMFbKqOR25ddeRisru5tdTmQYGRe87svWp2yovBZKBy2UVzVRpqHxXlkzuU19UH3l1Kxb_EqX1h43-njLRmlsNcKE7ykfWFgQqcHRbzcuSLqX6BdrTLndhjwl4rh8_nVKsIQBimdwg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9i-bmyfENBE3I_d-yETctnS4nK1w6QgFUSesSnDkUDS_EQtawn-Nix_m9B1j8b6n06Kj3qMLPEYtUQBvohwKwdOLUwLuwDBPX9BPg4RDhjfyxhspAcbPfZ2hpYceUK3iZZ5hn4a3IyexEF_nBLGT0moIpHV7WKipO07UIXUGbXqpiNY4q-qm17UqrGT5o21HOv69Ih51LyeJ9oLita-gKfGPr4Iy9o1fuBX3Y8YDwhlNEjIHhbWEVVsfoJ0fjUjfFJd1GD8KxViiS",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAXreAN9MNhfb8HiDo4jWi8VzY2bxqplZOuIAxUmrgzQloPrRytk_aBiQ5CEPrvbnyMMmjxBfIw_z_8Jcf7MyTSb6WKMS0SeRSrYEpoQkLpsxGYAzUsTjrQfO8nCFXsT1iOR9Xbn6dJ9iXFyLvs49s75OKXmFXWDWLZppGFgmENiBV6YbHQEz8Q8Mn5UBrm3I6dmgRzRsTLCjy6TuJyvR2iyi-7VvSVAYG3SU3TYsMIO2jO22dtjFTdq6YMFz3GJQ411ol5LYITsk7K",
];

const STATS = [
  { value: "200+", label: "Active Clinicians" },
  { value: "5K+", label: "Mothers Protected" },
  { value: "24/7", label: "AI Monitoring" },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-white dark:bg-slate-950 pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32"
      aria-labelledby="hero-heading"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-mesh" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-[480px] bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ---------------- Text column ---------------- */}
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass ring-1 ring-primary/15 text-primary text-xs sm:text-sm font-semibold shadow-sm">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              AI-Powered Maternal Care Platform
            </div>

            <h1
              id="hero-heading"
              className="animate-fade-up delay-100 mt-6 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight text-slate-900 dark:text-white text-balance"
            >
              Save lives with
              <span className="block text-gradient-brand pb-1">
                real-time monitoring
              </span>
            </h1>

            <p className="animate-fade-up delay-200 mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 text-pretty">
              Empowering rural mothers with{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">
                voice-first AI
              </strong>{" "}
              over WhatsApp — detect pregnancy complications early and alert
              doctors the moment they matter.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-300 mt-8 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
              <a
                href="#cta"
                className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3.5 rounded-xl shadow-glow transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
              >
                Get started free
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how-it-works"
                className="group inline-flex items-center justify-center gap-2 border border-slate-200 dark:border-white/15 hover:border-primary/40 text-slate-700 dark:text-white font-semibold px-7 py-3.5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
              >
                <PlayCircle className="h-5 w-5 text-primary" />
                See how it works
              </a>
            </div>

            {/* Trust row */}
            <div className="animate-fade-up delay-400 mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3" aria-hidden="true">
                {TRUST_AVATARS.map((src, i) => (
                  <Image
                    key={i}
                    alt=""
                    src={src}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 ring-1 ring-black/5 object-cover"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  +50
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1.5">
                  <div className="flex text-amber-400" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    4.9
                  </span>
                </div>
                <p className="text-xs mt-0.5">Trusted by healthcare providers</p>
              </div>
            </div>

            {/* Stats */}
            <dl className="animate-fade-up delay-500 mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-slate-200/70 dark:border-white/10 pt-6">
              {STATS.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {s.value}
                  </dd>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          {/* ---------------- Visual column ---------------- */}
          <div
            className="relative h-[420px] sm:h-[500px] lg:h-[580px] animate-fade-up delay-300"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-cyan-300/10 rounded-[2rem]" />

            {/* Product card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm">
              <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/[0.08] to-cyan-300/[0.08] border-b border-slate-100 dark:border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-glow-sm">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                      Live Monitoring
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time risk assessment
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/80 dark:bg-red-500/10 ring-1 ring-red-100 dark:ring-red-500/20">
                    <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <AlertCircle className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          High Risk Alert
                        </h4>
                        <time className="text-xs text-red-500 font-medium">
                          2 min ago
                        </time>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sarah K. — elevated blood pressure detected
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: "42", l: "Patients", c: "text-primary" },
                      { v: "8", l: "Pending", c: "text-amber-500" },
                      { v: "34", l: "Healthy", c: "text-emerald-500" },
                    ].map((m) => (
                      <div
                        key={m.l}
                        className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5"
                      >
                        <div className={`text-lg font-bold ${m.c}`}>{m.v}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {m.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <div className="hidden lg:flex absolute top-8 right-4 items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 animate-float-soft">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                95% Detection Rate
              </span>
            </div>
            <div
              className="hidden lg:flex absolute bottom-10 left-2 items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 animate-float-soft"
              style={{ animationDelay: "1.5s" }}
            >
              <Languages className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                10+ Languages
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
