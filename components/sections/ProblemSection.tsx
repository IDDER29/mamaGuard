export default function ProblemSection() {
  return (
    <section
      id="problem"
      className="py-12 sm:py-16 md:py-20 bg-slate-50 dark:bg-slate-800 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            Why Current Care Falls Short
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Millions of women in rural areas face preventable complications due
            to systemic gaps in the healthcare delivery model.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <article className="group bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <span className="material-icons-round text-2xl sm:text-3xl">
                school
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Knowledge Gap
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">
              Expectant mothers often lack awareness of critical danger signs,
              delaying the decision to seek help until it&apos;s too late.
            </p>
          </article>
          {/* Card 2 */}
          <article className="group bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <span className="material-icons-round text-2xl sm:text-3xl">
                directions_walk
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Distance Gap
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">
              Physical distance from clinics prevents frequent check-ups,
              leaving long periods of pregnancy completely unmonitored.
            </p>
          </article>
          {/* Card 3 */}
          <article className="group bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 sm:col-span-2 md:col-span-1">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <span className="material-icons-round text-2xl sm:text-3xl">
                visibility_off
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              Doctor Blindness
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm">
              Without real-time data between visits, doctors are reactive rather
              than proactive, often missing early warning signals.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
