/**
 * Application-wide constants and configuration
 */

export const APP_CONFIG = {
  name: "MamaGuard",
  tagline: "Maternal Early-Warning Platform",
  description: "Bridging the gap between rural mothers and medical professionals",
  email: "hello@mamaguard.health",
  phone: "+1 (555) 123-4567",
} as const;

export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  auth: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
} as const;

export const EXTERNAL_LINKS = {
  whatsapp: "https://wa.me/15551234567",
  github: "https://github.com/mamaguard",
  twitter: "https://twitter.com/mamaguard",
} as const;

export const RISK_LEVELS = {
  low: {
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Low Risk",
  },
  medium: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Medium Risk",
  },
  high: {
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "High Risk",
  },
} as const;

export const VITAL_THRESHOLDS = {
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 },
  },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 97.0, max: 99.5 },
} as const;
