"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/common/Navigation";
import Footer from "@/components/common/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      // Simulate login
      setTimeout(() => {
        if (email && password) {
          // For demo purposes, accept any credentials
          router.push("/dashboard");
        } else {
          setError("Please enter both email and password");
          setIsLoading(false);
        }
      }, 1000);
    },
    [email, password, router],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navigation />
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-10rem)]">
            {/* Left Side: Hero Image */}
            <div className="hidden lg:flex relative bg-primary/5 rounded-3xl overflow-hidden min-h-[500px] lg:min-h-[600px]">
              {/* Background Image */}
              <Image
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&q=80"
                alt="Healthcare professional with patient"
                fill
                className="object-cover"
                priority
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

              {/* Content */}
              <div className="relative z-10 mt-auto p-8 sm:p-10 lg:p-12 text-white">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <span className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Trusted by 500+ Clinics
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                  Empowering clinicians with real-time maternal insights.
                </h2>
                <p className="text-base sm:text-lg text-slate-200 font-light leading-relaxed">
                  Join the secure network dedicated to improving outcomes for
                  mothers everywhere.
                </p>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full flex flex-col justify-center relative">
              {/* Decoration: Top Right Abstract Shape */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 relative z-10">
                {/* Logo & Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 mb-4 sm:mb-6">
                    <span className="material-icons-round text-primary text-3xl sm:text-4xl">
                      favorite
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome Back
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Secure access to the MamaGuard portal
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-[20px]">
                      error
                    </span>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6 mt-6 sm:mt-8"
                >
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl">
                          mail
                        </span>
                      </div>
                      <input
                        autoComplete="email"
                        className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        id="email"
                        name="email"
                        placeholder="name@clinic.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        htmlFor="password"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl group-focus-within:text-primary transition-colors">
                          lock
                        </span>
                      </div>
                      <input
                        autoComplete="current-password"
                        className="block w-full pl-10 pr-10 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                          type="button"
                          onClick={togglePasswordVisibility}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          <span className="material-symbols-outlined text-xl">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <a
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        href="#"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  {/* Login Button */}
                  <div className="pt-2">
                    <button
                      className="w-full flex justify-center items-center gap-2 py-3 sm:py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">
                            progress_activity
                          </span>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Secure Login</span>
                          <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                      Secure System
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                      href="/register"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>

                {/* Footer Trust Badges */}
                <div className="pt-8 flex items-center justify-center gap-4 text-slate-400 opacity-60">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      verified_user
                    </span>
                    <span className="text-xs font-semibold tracking-wide">
                      HIPAA Compliant
                    </span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      lock
                    </span>
                    <span className="text-xs font-semibold tracking-wide">
                      SSL Encrypted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
