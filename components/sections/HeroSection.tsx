import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 overflow-hidden bg-white dark:bg-slate-900"
      aria-labelledby="hero-heading"
    >
      {/* Enhanced Background Elements */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:to-primary/5"
        aria-hidden="true"
      ></div>
      <div
        className="absolute top-20 right-0 -mr-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        aria-hidden="true"
      ></div>
      <div
        className="absolute bottom-0 left-0 -ml-40 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left space-y-6 sm:space-y-8">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-cyan-400/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold backdrop-blur-sm"
              role="status"
              aria-label="AI-Powered platform status"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI-Powered Maternal Care Platform
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
            >
              <span className="text-gray-900 dark:text-gray-100 font-extrabold">
                Save Lives with
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary animate-gradient bg-300%">
                Real-Time Monitoring
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Empowering rural mothers with{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">
                voice-first AI technology
              </strong>{" "}
              via WhatsApp. Detect pregnancy complications early, alert doctors
              instantly.
            </p>

            {/* Stats Bar - Mobile Friendly */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 py-4"
              role="list"
              aria-label="Platform statistics"
            >
              <div className="text-center lg:text-left" role="listitem">
                <div
                  className="text-2xl sm:text-3xl font-bold text-primary"
                  aria-label="200 plus active clinicians"
                >
                  200+
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Active Clinicians
                </div>
              </div>
              <div
                className="h-12 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"
                aria-hidden="true"
              ></div>
              <div className="text-center lg:text-left" role="listitem">
                <div
                  className="text-2xl sm:text-3xl font-bold text-primary"
                  aria-label="5000 plus mothers protected"
                >
                  5K+
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Mothers Protected
                </div>
              </div>
              <div
                className="h-12 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"
                aria-hidden="true"
              ></div>
              <div className="text-center lg:text-left" role="listitem">
                <div
                  className="text-2xl sm:text-3xl font-bold text-primary"
                  aria-label="24/7 AI monitoring"
                >
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  AI Monitoring
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <a
                href="#cta"
                className="group bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
              >
                Get Started Free
                <span
                  className="material-icons-round text-xl group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </a>
              <a
                href="#video-demo"
                className="group border-2 border-slate-300 dark:border-white/20 hover:border-primary text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
              >
                <span
                  className="material-icons-round text-xl"
                  aria-hidden="true"
                >
                  play_circle
                </span>
                Watch Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <div
                className="flex -space-x-3"
                role="list"
                aria-label="Healthcare providers"
              >
                <Image
                  alt="Healthcare provider"
                  className="w-10 h-10 rounded-full border-3 border-white dark:border-slate-900 ring-2 ring-primary/20"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUwQUfdZeJDrmZtLQhKwNt9LpB18GBLqbTwjKIimAj90WK9_Ab2IOsXS5S2BrkhmR0WHKA-gUMMNQWMUXbCZcTWR1S1WYdo8uLTQce2uXN-5SZ437MO7Ftrqf5ccBKNEwlrTQMFbKqOR25ddeRisru5tdTmQYGRe87svWp2yovBZKBy2UVzVRpqHxXlkzuU19UH3l1Kxb_EqX1h43-njLRmlsNcKE7ykfWFgQqcHRbzcuSLqX6BdrTLndhjwl4rh8_nVKsIQBimdwg"
                  width={40}
                  height={40}
                />
                <Image
                  alt="Healthcare provider"
                  className="w-10 h-10 rounded-full border-3 border-white dark:border-slate-900 ring-2 ring-primary/20"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9i-bmyfENBE3I_d-yETctnS4nK1w6QgFUSesSnDkUDS_EQtawn-Nix_m9B1j8b6n06Kj3qMLPEYtUQBvohwKwdOLUwLuwDBPX9BPg4RDhjfyxhspAcbPfZ2hpYceUK3iZZ5hn4a3IyexEF_nBLGT0moIpHV7WKipO07UIXUGbXqpiNY4q-qm17UqrGT5o21HOv69Ih51LyeJ9oLita-gKfGPr4Iy9o1fuBX3Y8YDwhlNEjIHhbWEVVsfoJ0fjUjfFJd1GD8KxViiS"
                  width={40}
                  height={40}
                />
                <Image
                  alt="Healthcare provider"
                  className="w-10 h-10 rounded-full border-3 border-white dark:border-slate-900 ring-2 ring-primary/20"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXreAN9MNhfb8HiDo4jWi8VzY2bxqplZOuIAxUmrgzQloPrRytk_aBiQ5CEPrvbnyMMmjxBfIw_z_8Jcf7MyTSb6WKMS0SeRSrYEpoQkLpsxGYAzUsTjrQfO8nCFXsT1iOR9Xbn6dJ9iXFyLvs49s75OKXmFXWDWLZppGFgmENiBV6YbHQEz8Q8Mn5UBrm3I6dmgRzRsTLCjy6TuJyvR2iyi-7VvSVAYG3SU3TYsMIO2jO22dtjFTdq6YMFz3GJQ411ol5LYITsk7K"
                  width={40}
                  height={40}
                />
                <div className="w-10 h-10 rounded-full border-3 border-white dark:border-slate-900 ring-2 ring-primary/20 bg-primary flex items-center justify-center text-white text-xs font-bold">
                  +50
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 text-center lg:text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="flex text-yellow-400"
                    role="img"
                    aria-label="5 star rating"
                  >
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-icons-round text-base"
                        aria-hidden="true"
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    4.9
                  </span>
                </div>
                <p className="text-xs">
                  Trusted by healthcare providers worldwide
                </p>
              </div>
            </div>
          </div>

          {/* Visual Content - Improved for all screens */}
          <div
            className="relative lg:h-[600px] h-[400px] md:h-[500px]"
            aria-hidden="true"
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-cyan-400/10 rounded-3xl"></div>

            {/* Main Feature Card - Visible on all screens */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transform hover:scale-105 transition-transform duration-500">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-cyan-400/10 p-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                      <span className="material-icons-round text-2xl">
                        health_and_safety
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        Live Monitoring
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Real-time risk assessment
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Patient Alert */}
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                      <span className="material-icons-round">
                        priority_high
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          High Risk Alert
                        </h4>
                        <time className="text-xs text-red-600 dark:text-red-400 font-medium">
                          2 min ago
                        </time>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        Patient Sarah K. - Elevated BP detected
                      </p>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-lg transition-colors"
                          type="button"
                        >
                          View Details
                        </button>
                        <button
                          className="px-3 py-1.5 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white text-xs font-semibold rounded-lg hover:border-primary hover:text-primary transition-colors"
                          type="button"
                        >
                          Call Patient
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                      <div className="text-lg font-bold text-primary">42</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">
                        Patients
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                      <div className="text-lg font-bold text-yellow-500">8</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">
                        Pending
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                      <div className="text-lg font-bold text-green-500">34</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400">
                        Healthy
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="hidden lg:block absolute top-10 right-10 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 animate-bounce-slow">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-green-500">
                  check_circle
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  95% Detection Rate
                </span>
              </div>
            </div>

            <div className="hidden lg:block absolute bottom-10 left-10 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-primary">
                  language
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  10+ Languages
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
