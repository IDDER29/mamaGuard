import type { PatientManagementCard } from "@/types";

export const mockPatientManagementData: PatientManagementCard[] = [
  {
    id: "1",
    patientId: "MG-891",
    name: "Sarah Jenkins",
    age: 28,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "high-risk",
    gestationalWeek: 34,
    trimester: 3,
    aiAnalysis: "Preeclampsia history detected. BP check overdue by 2 days. Recommend immediate follow-up.",
    aiKeyPoints: ["BP Overdue: 2 days", "History: Preeclampsia", "Action: Immediate follow-up"],
    lastActivity: "2h ago",
    lastActivityTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextAppointment: "Tomorrow 2pm",
    phone: "+1-234-567-8901",
    isOverdue: true,
    assignedCareTeam: [
      { initials: "AS", name: "Dr. A. Smith" },
      { initials: "NJ", name: "Nurse Joy" }
    ],
    progressPercent: 85
  },
  {
    id: "2",
    patientId: "MG-902",
    name: "Maria Rodriguez",
    age: 31,
    initials: "MR",
    avatarColor: "indigo",
    status: "stable",
    gestationalWeek: 12,
    trimester: 1,
    aiAnalysis: "Vitals consistent. Nutrition plan adherence high (95%). Routine check recommended.",
    aiKeyPoints: ["Vitals: Normal", "Nutrition: 95% adherence", "Status: On track"],
    lastActivity: "1 day ago",
    lastActivityTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextAppointment: "Next week",
    phone: "+1-234-567-8902",
    isOverdue: false,
    assignedCareTeam: [
      { initials: "BJ", name: "Dr. B. Johnson" }
    ],
    progressPercent: 30
  },
  {
    id: "3",
    patientId: "MG-774",
    name: "Emily Chen",
    age: 34,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    status: "monitor",
    gestationalWeek: 28,
    trimester: 2,
    aiAnalysis: "Gestational diabetes indicators. Diet adjustment phase. Weekly log required.",
    aiKeyPoints: ["Condition: GD indicators", "Phase: Diet adjustment", "Follow-up: Weekly"],
    lastActivity: "5h ago",
    lastActivityTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    nextAppointment: "Friday 10am",
    phone: "+1-234-567-8903",
    isOverdue: false,
    assignedCareTeam: [
      { initials: "AS", name: "Dr. A. Smith" }
    ],
    progressPercent: 70
  },
  {
    id: "4",
    patientId: "MG-888",
    name: "Lara Peterson",
    age: 24,
    initials: "LP",
    avatarColor: "purple",
    status: "stable",
    gestationalWeek: 8,
    trimester: 1,
    aiAnalysis: "First pregnancy. Low risk factors. Ultrasound scheduled for next week.",
    aiKeyPoints: ["Type: First pregnancy", "Risk: Low", "Next: Ultrasound"],
    lastActivity: "12h ago",
    lastActivityTimestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    nextAppointment: "Next week",
    phone: "+1-234-567-8904",
    isOverdue: false,
    assignedCareTeam: [
      { initials: "KW", name: "Dr. K. Wilson" }
    ],
    progressPercent: 20
  },
  {
    id: "5",
    patientId: "MG-915",
    name: "Fatima Al-Sayed",
    age: 29,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    status: "due-soon",
    gestationalWeek: 41,
    trimester: "overdue",
    aiAnalysis: "Past due date (41 weeks). Induction planned for Tuesday. Monitor fetal movement.",
    aiKeyPoints: ["Status: Overdue (41w)", "Plan: Induction Tuesday", "Monitor: Fetal movement"],
    lastActivity: "30min ago",
    lastActivityTimestamp: new Date(Date.now() - 30 * 60 * 1000),
    nextAppointment: "Today 4pm",
    phone: "+1-234-567-8905",
    isOverdue: true,
    assignedCareTeam: [
      { initials: "BJ", name: "Dr. B. Johnson" }
    ],
    progressPercent: 100
  },
  {
    id: "6",
    patientId: "MG-930",
    name: "Jane Doe",
    age: 30,
    initials: "JD",
    avatarColor: "pink",
    status: "stable",
    gestationalWeek: 16,
    trimester: 2,
    aiAnalysis: "Returning patient. Second child. Standard progression detected.",
    aiKeyPoints: ["Type: Second child", "Progress: Standard", "Status: Normal"],
    lastActivity: "3 days ago",
    lastActivityTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextAppointment: "Next month",
    phone: "+1-234-567-8906",
    isOverdue: false,
    assignedCareTeam: [
      { initials: "KW", name: "Dr. K. Wilson" }
    ],
    progressPercent: 40
  }
];

export const patientManagementStats = {
  complianceRate: 98.4,
  highRiskAlerts: 12,
  checkupsToday: 8,
  totalPatients: 1248
};
