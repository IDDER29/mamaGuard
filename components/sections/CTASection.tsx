export default function CTASection() {
  return (
    <section
      id="cta"
      className="py-16 sm:py-20 md:py-24 relative bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-950 dark:to-black"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -z-10"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight text-white">
          Bring MamaGuard to Your Clinic
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
          Join the network of care providers transforming maternal health
          outcomes.
        </p>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-2 rounded-xl shadow-2xl">
          <form
            className="flex flex-col gap-2"
            method="POST"
            action="/api/demo-request"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="name" className="sr-only">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                className="flex-1 bg-slate-900/80 border-0 text-white placeholder-gray-500 px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Your Name"
                type="text"
                required
              />
              <label htmlFor="clinic" className="sr-only">
                Clinic or Organization
              </label>
              <input
                id="clinic"
                name="clinic"
                className="flex-1 bg-slate-900/80 border-0 text-white placeholder-gray-500 px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Clinic / Organization"
                type="text"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                className="flex-1 bg-slate-900/80 border-0 text-white placeholder-gray-500 px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all outline-none"
                placeholder="Email Address"
                type="email"
                required
              />
              <button
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-200 whitespace-nowrap shadow-[0_0_20px_rgba(17,180,212,0.3)] hover:shadow-[0_0_30px_rgba(17,180,212,0.5)] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                type="submit"
              >
                Request Demo
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
          Free pilot program available for rural health centers.
        </p>
      </div>
    </section>
  );
}
