export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 relative overflow-hidden bg-slate-50 dark:bg-slate-800"
    >
      {/* Background Elements */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            How MamaGuard Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connecting rural mothers to life-saving care through simple voice
            technology.
          </p>
        </header>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div
            className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"
            aria-hidden="true"
          ></div>
          {/* Progress Line Gradient overlay */}
          <div
            className="hidden md:block absolute top-12 left-[10%] w-3/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -z-10 opacity-50"
            aria-hidden="true"
          ></div>

          <ol className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <li className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/5 group-hover:border-primary/50 transition-colors duration-300 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-white dark:border-slate-800">
                  1
                </span>
                <span
                  className="material-icons-round text-4xl text-primary"
                  aria-hidden="true"
                >
                  mic
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Mother Reports
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                Voice message describing symptoms sent simply via WhatsApp.
              </p>
            </li>

            {/* Step 2 */}
            <li className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/5 group-hover:border-primary/50 transition-colors duration-300 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-900 text-primary rounded-full flex items-center justify-center font-bold text-sm border-4 border-white dark:border-slate-800">
                  2
                </span>
                <span
                  className="material-icons-round text-4xl text-primary"
                  aria-hidden="true"
                >
                  psychology
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                System Analyzes
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                AI instantly processes language and flags danger signs.
              </p>
            </li>

            {/* Step 3 */}
            <li className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/5 group-hover:border-primary/50 transition-colors duration-300 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-900 text-primary rounded-full flex items-center justify-center font-bold text-sm border-4 border-white dark:border-slate-800">
                  3
                </span>
                <span
                  className="material-icons-round text-4xl text-primary"
                  aria-hidden="true"
                >
                  notifications_active
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Doctor Alerted
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                Clinicians view priority cases on a real-time dashboard.
              </p>
            </li>

            {/* Step 4 */}
            <li className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/5 group-hover:border-primary/50 transition-colors duration-300 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-900 text-primary rounded-full flex items-center justify-center font-bold text-sm border-4 border-white dark:border-slate-800">
                  4
                </span>
                <span
                  className="material-icons-round text-4xl text-primary"
                  aria-hidden="true"
                >
                  family_restroom
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Family Notified
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                Automated guidance sent to family and transport dispatched.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
