"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/common/Navigation";
import Footer from "@/components/common/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    affiliation: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // Clear field error when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [fieldErrors],
  );

  // Validate email on blur
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
    }
  }, []);

  // Check password match
  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      // Validation
      if (!formData.terms) {
        setError("Please agree to the Terms of Service and Privacy Policy");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      // Check for any field errors
      if (Object.keys(fieldErrors).length > 0) {
        setError("Please fix the errors in the form");
        return;
      }

      setIsLoading(true);

      // Simulate registration
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    },
    [formData, router, fieldErrors],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["", "Weak", "Medium", "Strong", "Very Strong"];

  // Calculate form completion
  const totalFields = 7; // fullName, email, phone, role, affiliation, password, confirmPassword
  const completedFields = Object.entries(formData).filter(([key, value]) => {
    if (key === "terms") return false; // Don't count terms in progress
    if (typeof value === "string") return value.trim().length > 0;
    return false;
  }).length;
  const formProgress = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Navigation />
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Side: Hero Image */}
            <div className="hidden lg:flex bg-primary/5 rounded-3xl overflow-hidden min-h-[750px] lg:min-h-[800px] relative">
              {/* Background Image */}
              <Image
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80"
                alt="Healthcare professionals collaborating"
                fill
                className="object-cover object-center"
                priority
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

              {/* Content */}
              <div className="relative z-10 mt-auto p-8 sm:p-10 lg:p-12 text-white">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <span className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Join 500+ Clinics
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                  Start protecting mothers with AI-powered insights.
                </h2>
                <p className="text-base sm:text-lg text-slate-200 font-light leading-relaxed">
                  Create your professional account to access the MamaGuard
                  clinical platform and help improve maternal health outcomes.
                </p>
              </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full">
              {/* Decoration: Top Right Abstract Shape */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="w-full max-w-2xl mx-auto relative z-10">
                {/* Logo & Header */}
                <div className="text-center space-y-2 mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 mb-4 sm:mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl">
                      local_hospital
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Clinician Registration
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Create your professional account to access patient records
                  </p>
                </div>

                {/* Progress Indicator */}
                {formProgress > 0 && formProgress < 100 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Form Progress
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {formProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${formProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">
                      error
                    </span>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Personal Information */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 uppercase text-xs font-bold tracking-wider">
                      <span className="material-symbols-outlined text-sm">
                        person
                      </span>
                      Personal Information
                    </div>

                    <div className="space-y-6">
                      {/* Full Name */}
                      <div>
                        <label
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          htmlFor="fullName"
                        >
                          Full Name &amp; Title
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-xl">
                              badge
                            </span>
                          </div>
                          <input
                            className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                            id="fullName"
                            name="fullName"
                            placeholder="e.g. Dr. Sarah Jenkins"
                            type="text"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                            htmlFor="email"
                          >
                            Work Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="material-symbols-outlined text-slate-400 text-xl">
                                mail
                              </span>
                            </div>
                            <input
                              autoComplete="email"
                              className={`block w-full pl-10 pr-3 py-3 sm:py-3.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                                fieldErrors.email
                                  ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                                  : "border-slate-200 dark:border-slate-700 focus:ring-primary"
                              }`}
                              id="email"
                              name="email"
                              placeholder="name@hospital.org"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              onBlur={(e) => validateEmail(e.target.value)}
                              disabled={isLoading}
                              required
                              aria-invalid={!!fieldErrors.email}
                              aria-describedby={
                                fieldErrors.email ? "email-error" : undefined
                              }
                            />
                          </div>
                          {fieldErrors.email && (
                            <p
                              id="email-error"
                              className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">
                                error
                              </span>
                              {fieldErrors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                            htmlFor="phone"
                          >
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="material-symbols-outlined text-slate-400 text-xl">
                                phone
                              </span>
                            </div>
                            <input
                              autoComplete="tel"
                              className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                              id="phone"
                              name="phone"
                              placeholder="+1 (555) 000-0000"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              required
                              aria-describedby="phone-help"
                            />
                          </div>
                          <p
                            id="phone-help"
                            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
                          >
                            For urgent patient care notifications
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Professional Credentials */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 uppercase text-xs font-bold tracking-wider">
                      <span className="material-symbols-outlined text-sm">
                        medical_services
                      </span>
                      Professional Credentials
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Role */}
                      <div>
                        <label
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          htmlFor="role"
                        >
                          Role
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-xl">
                              work
                            </span>
                          </div>
                          <select
                            className="block w-full pl-10 pr-10 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                          >
                            <option value="">Select your role</option>
                            <option value="doctor">Doctor (MD/DO)</option>
                            <option value="nurse">Nurse (RN/LPN)</option>
                            <option value="midwife">Midwife</option>
                            <option value="admin">Administrator</option>
                            <option value="specialist">Specialist</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-xl">
                              expand_more
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Affiliation */}
                      <div>
                        <label
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          htmlFor="affiliation"
                        >
                          Clinic/Hospital Affiliation
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-xl">
                              domain
                            </span>
                          </div>
                          <input
                            className="block w-full pl-10 pr-3 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                            id="affiliation"
                            list="hospitals"
                            name="affiliation"
                            placeholder="Type to search facilities..."
                            type="text"
                            value={formData.affiliation}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                          />
                          <datalist id="hospitals">
                            <option value="City General Hospital" />
                            <option value="MamaGuard Main Clinic" />
                            <option value="Westside Maternity Center" />
                            <option value="North Hills Medical Group" />
                          </datalist>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Security */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 uppercase text-xs font-bold tracking-wider">
                      <span className="material-symbols-outlined text-sm">
                        lock
                      </span>
                      Security
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Password */}
                      <div>
                        <label
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          htmlFor="password"
                        >
                          Create Password
                        </label>
                        <div className="relative">
                          <input
                            autoComplete="new-password"
                            className="block w-full pl-3 pr-10 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                            aria-describedby="password-requirements"
                          />
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            type="button"
                            onClick={togglePasswordVisibility}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            <span className="material-symbols-outlined text-xl">
                              {showPassword ? "visibility" : "visibility_off"}
                            </span>
                          </button>
                        </div>

                        {/* Password Requirements */}
                        {!formData.password && (
                          <p
                            id="password-requirements"
                            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
                          >
                            Min. 8 characters with uppercase, lowercase &amp;
                            number
                          </p>
                        )}

                        {/* Strength Meter */}
                        {formData.password && (
                          <>
                            <div className="flex gap-1 mt-2 h-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`flex-1 rounded-full transition-colors ${
                                    level <= passwordStrength
                                      ? "bg-primary"
                                      : "bg-slate-200 dark:bg-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                            <p
                              id="password-requirements"
                              className="text-xs text-slate-500 dark:text-slate-400 mt-1.5"
                            >
                              {strengthLabels[passwordStrength]} strength
                            </p>
                          </>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          htmlFor="confirmPassword"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            autoComplete="new-password"
                            className={`block w-full pl-3 pr-10 py-3 sm:py-3.5 border rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                              passwordsMismatch
                                ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                                : passwordsMatch
                                  ? "border-green-300 dark:border-green-700 focus:ring-green-500"
                                  : "border-slate-200 dark:border-slate-700 focus:ring-primary"
                            }`}
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            required
                            aria-invalid={passwordsMismatch ? true : undefined}
                            aria-describedby={
                              passwordsMismatch
                                ? "confirm-password-error"
                                : passwordsMatch
                                  ? "confirm-password-success"
                                  : undefined
                            }
                          />
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            <span className="material-symbols-outlined text-xl">
                              {showConfirmPassword
                                ? "visibility"
                                : "visibility_off"}
                            </span>
                          </button>
                        </div>

                        {/* Password Match Feedback */}
                        {passwordsMismatch && (
                          <p
                            id="confirm-password-error"
                            className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">
                              error
                            </span>
                            Passwords do not match
                          </p>
                        )}
                        {passwordsMatch && (
                          <p
                            id="confirm-password-success"
                            className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">
                              check_circle
                            </span>
                            Passwords match
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Legal & Consent */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
                      <div className="flex items-center h-5">
                        <input
                          className="w-4 h-4 text-primary bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-primary focus:ring-2 dark:ring-offset-slate-900"
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={formData.terms}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:text-primary/80 underline"
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:text-primary/80 underline"
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Privacy Policy
                          </Link>
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          By creating an account, you consent to
                          MamaGuard&apos;s clinical data handling protocols.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Clinical Account
                          <span className="material-symbols-outlined text-white/80 group-hover:translate-x-1 transition-transform text-sm">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <Link
                        href="/login"
                        className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors inline-flex items-center gap-1 group"
                      >
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                          arrow_back
                        </span>
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
