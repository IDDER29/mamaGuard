import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="relative py-20 sm:py-28 bg-slate-950 overflow-hidden">
      {/* Glow + mesh */}
      <div className="absolute inset-0 bg-mesh opacity-70" aria-hidden="true" />
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] bg-primary/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 ring-1 ring-white/15 text-primary text-xs sm:text-sm font-semibold mb-6">
          <ShieldCheck className="h-4 w-4" />
          Free pilot for rural health centers
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white text-balance">
          Bring MamaGuard to your clinic
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto text-pretty">
          Join the network of care providers transforming maternal health
          outcomes across the region.
        </p>

        <div className="mt-10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm p-3 shadow-2xl">
          <form className="flex flex-col gap-2.5" method="POST" action="/api/demo-request">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="name" className="sr-only">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                className="flex-1 bg-white/[0.03] ring-1 ring-white/10 text-white placeholder-slate-500 px-5 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Your name"
                type="text"
                required
              />
              <label htmlFor="clinic" className="sr-only">
                Clinic or Organization
              </label>
              <input
                id="clinic"
                name="clinic"
                className="flex-1 bg-white/[0.03] ring-1 ring-white/10 text-white placeholder-slate-500 px-5 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Clinic / organization"
                type="text"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                className="flex-1 bg-white/[0.03] ring-1 ring-white/10 text-white placeholder-slate-500 px-5 py-3.5 rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Email address"
                type="email"
                required
              />
              <button
                className="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 whitespace-nowrap shadow-glow hover:-translate-y-0.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                type="submit"
              >
                Request demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          No credit card required · Set up in minutes · Cancel anytime.
        </p>
      </div>
    </section>
  );
}
