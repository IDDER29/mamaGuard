export default function Navigation() {
  return (
    <nav className="fixed w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a
            href="/"
            className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-1"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-icons-round text-xl">favorite</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Mama<span className="text-primary">Guard</span>
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              href="#solution"
            >
              Solution
            </a>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              href="#testimonials"
            >
              Testimonials
            </a>
            <div className="flex items-center space-x-4 pl-4 border-l border-gray-200 dark:border-white/10">
              <a
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                href="/login"
              >
                Login
              </a>
              <a
                className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 inline-block"
                href="#cta"
              >
                Request Demo
              </a>
            </div>
          </div>

          {/* Mobile menu button - Simple link to sections */}
          <div className="md:hidden flex items-center gap-2">
            <a
              className="text-slate-600 dark:text-slate-300 hover:text-primary p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-colors text-sm font-medium"
              href="#cta"
            >
              Demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
