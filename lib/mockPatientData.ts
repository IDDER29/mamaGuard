import type { 
  PatientProfile, 
  VitalSign, 
  ClinicalHistoryItem, 
  VoiceMessage, 
  EmergencyContact,
  RiskTrendData 
} from "@/types";

export const mockPatientProfile: PatientProfile = {
  id: "MG-8922",
  name: "Malika Ahmed",
  age: 28,
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Malika",
  riskLevel: "high",
  gestationalWeek: 32,
  trimester: 3,
  bloodType: "O+",
  patientId: "MG-8922",
  nextCheckup: "Oct 24, 2023",
  assignedDoctor: "Dr. Sarah Johnson"
};

export const mockVitals: VitalSign[] = [
  {
    label: "Blood Pressure",
    value: "140/90",
    unit: "mmHg",
    status: "critical",
    trend: "up",
    note: "Hypertension Alert"
  },
  {
    label: "Weight",
    value: "72",
    unit: "kg",
    status: "normal",
    trend: "up",
    trendValue: "+1.5kg",
    progress: 75
  },
  {
    label: "Fetal Movement",
    value: "8",
    unit: "kicks/hr",
    status: "normal",
    note: "Normal Range (6-10)"
  }
];

export const mockClinicalHistory: ClinicalHistoryItem[] = [
  {
    id: "1",
    date: "2021 (Previous Pregnancy)",
    description: "Pre-eclampsia diagnosed"
  },
  {
    id: "2",
    date: "Jan 2023",
    description: "Mild Anemia"
  },
  {
    id: "3",
    date: "Chronic",
    description: "Allergy: Penicillin"
  }
];

export const mockVoiceMessages: VoiceMessage[] = [
  {
    id: "1",
    timestamp: "9:30 AM",
    transcript: "I have a persistent headache since morning and my vision feels a bit blurry at the edges.",
    duration: "0:14",
    tags: ["#HypertensionRisk", "#Headache", "#VisionBlur"],
    priority: "high",
    highlightedTerms: ["persistent headache", "vision feels a bit blurry"]
  },
  {
    id: "2",
    timestamp: "8:15 AM",
    transcript: "Is it normal to feel a bit of swelling in my ankles?",
    duration: "0:08",
    tags: ["#Edema"],
    priority: "medium"
  },
  {
    id: "3",
    timestamp: "8:00 PM",
    transcript: "Feeling slight dizziness when standing up quickly.",
    duration: "0:10",
    tags: ["#Dizziness"],
    priority: "medium"
  }
];

export const mockEmergencyContact: EmergencyContact = {
  name: "Ali Ahmed",
  relationship: "Husband",
  initials: "AA",
  phone: "+1-234-567-8900"
};

export const mockRiskTrend: RiskTrendData[] = [
  { date: "14 days ago", riskScore: 20 },
  { date: "13 days ago", riskScore: 25 },
  { date: "12 days ago", riskScore: 22 },
  { date: "11 days ago", riskScore: 30 },
  { date: "10 days ago", riskScore: 28 },
  { date: "9 days ago", riskScore: 35 },
  { date: "8 days ago", riskScore: 40 },
  { date: "7 days ago", riskScore: 45 },
  { date: "6 days ago", riskScore: 42 },
  { date: "5 days ago", riskScore: 50 },
  { date: "4 days ago", riskScore: 55 },
  { date: "3 days ago", riskScore: 65 },
  { date: "Yesterday", riskScore: 85 },
  { date: "Today", riskScore: 90 }
];
