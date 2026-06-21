"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV_LINKS = [
  { href: "#solution", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#testimonials", label: "Testimonials" },
] as const;

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Add a stronger border/shadow once the user scrolls past the hero top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-shadow duration-300 ${
        scrolled
          ? "border-b border-gray-200 dark:border-slate-700 shadow-sm"
          : "border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-1"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
              <Heart className="h-5 w-5 fill-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Mama<span className="text-primary">Guard</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
              <ThemeToggle />
              <Link
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1"
                href="/login"
              >
                Login
              </Link>
              <a
                className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 inline-block"
                href="#cta"
              >
                Request Demo
              </a>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-72 bg-white dark:bg-slate-900 p-0"
              >
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>

                <div className="flex items-center gap-2 h-20 px-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                    <Heart className="h-5 w-5 fill-white" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    Mama<span className="text-primary">Guard</span>
                  </span>
                </div>

                <div className="flex flex-col px-4 py-6 gap-1">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="px-3 py-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary dark:hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}

                  <div className="my-3 h-px bg-gray-200 dark:bg-slate-700" />

                  <SheetClose asChild>
                    <Link
                      href="/login"
                      className="px-3 py-3 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary transition-colors"
                    >
                      Login
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href="#cta"
                      className="mt-2 bg-primary hover:bg-primary/90 text-white text-base font-semibold px-4 py-3 rounded-xl text-center shadow-lg shadow-primary/25 transition-colors"
                    >
                      Request Demo
                    </a>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
