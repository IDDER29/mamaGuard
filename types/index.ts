/**
 * Common type definitions for the MamaGuard application
 */

export interface Patient {
  id: string;
  phone_number: string;
  full_name: string | null;
  name: string; // Fallback field
  due_date: string | null;
  gestational_week: number;
  risk_level: "low" | "medium" | "high" | "critical";
  language: string;
  medical_history: { notes?: string } | null;
  created_at: string;

  // New Clinical Fields
  date_of_birth: string | null;
  national_id: string | null;
  location_address: string | null;
  trimester: 1 | 2 | 3 | null;
  blood_type: string | null;
  previous_pregnancies: number;
  current_medications: string | null;
  allergies: string | null;

  // Emergency/Support
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
  preferred_checkup_time: string | null;
  has_smartphone: boolean;
}

export interface VitalSign {
  id: string;
  patientId: string;
  timestamp: Date;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  temperature?: number;
  symptoms?: string[];
}

export interface Alert {
  id: string;
  patientId: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  avatar?: string;
}

export interface CTAFormData {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  message?: string;
}

// Dashboard Types
export type PatientRiskLevel = "critical" | "warning" | "stable" | "normal";

export interface DashboardPatient extends Patient {
  avatarUrl: string;
  lastUpdate: string; // Calculated field (e.g. "2h ago")
  alert: {
    type: string;
    category: string;
    message: string;
  };
  metrics: {
    label: string;
    value: string | number;
    trend: "up" | "down" | "stable";
  }[];
  trendData?: number[];
}

export interface DashboardStats {
  critical: number;
  warning: number;
  stable: number;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  email: string;
}

// Patient Profile Types
export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  riskLevel: "high" | "medium" | "low";
  gestationalWeek: number;
  trimester: number;
  bloodType: string;
  patientId: string;
  nextCheckup: string;
  assignedDoctor: string;
}

// Patient Management Types
export interface PatientManagementCard {
  id: string;
  patientId: string;
  name: string;
  age: number;
  avatarUrl?: string;
  initials?: string;
  avatarColor?: string;
  status: "high-risk" | "stable" | "monitor" | "due-soon";
  gestationalWeek: number;
  trimester: 1 | 2 | 3 | "overdue";
  aiAnalysis: string;
  aiKeyPoints?: string[]; // New: condensed key points
  lastActivity?: string; // New: "2h ago", "3 days ago"
  lastActivityTimestamp?: Date; // New: for sorting
  nextAppointment?: string; // New: "Tomorrow 2pm"
  phone?: string; // New: for quick call
  isOverdue?: boolean; // New: for filtering
  assignedCareTeam: {
    initials: string;
    name: string;
  }[];
  progressPercent: number;
}

export interface VitalSign {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  note?: string;
  progress?: number; // 0-100 for progress bars
}

export interface ClinicalHistoryItem {
  id: string;
  date: string;
  description: string;
}

export interface VoiceMessage {
  id: string;
  timestamp: string;
  transcript: string;
  audioUrl?: string;
  duration: string;
  tags: string[];
  priority: "high" | "medium" | "low";
  highlightedTerms?: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  initials: string;
  phone?: string;
}

export interface RiskTrendData {
  date: string;
  riskScore: number; // 0-100
}

// Patient Management Stats
export interface PatientManagementStats {
  totalPatients: number;
  highRiskAlerts: number;
  checkupsToday: number;
  complianceRate: number;
}
