"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, ExternalLink, Phone, Siren } from "lucide-react";
import type { Patient } from "@/types";

const RISK_CONFIG = {
  critical: {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    badgeText: "Critical",
    aiBox: "bg-rose-50/80 ring-rose-100",
    aiAccent: "bg-rose-500",
    aiIcon: "text-rose-500",
    aiLabel: "text-rose-700",
    aiText: "text-rose-800",
    progressBar: "bg-rose-500",
    progressShadow: "shadow-[0_0_10px_rgba(244,63,94,0.5)]",
    hasPulse: true,
  },
  high: {
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    badgeText: "High Risk",
    aiBox: "bg-orange-50/80 ring-orange-100",
    aiAccent: "bg-orange-500",
    aiIcon: "text-orange-500",
    aiLabel: "text-orange-700",
    aiText: "text-orange-800",
    progressBar: "bg-orange-500",
    progressShadow: "shadow-[0_0_10px_rgba(251,146,60,0.5)]",
    hasPulse: true,
  },
  medium: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    badgeText: "Monitor",
    aiBox: "bg-amber-50/80 ring-amber-100",
    aiAccent: "bg-amber-500",
    aiIcon: "text-amber-600",
    aiLabel: "text-amber-700",
    aiText: "text-amber-800",
    progressBar: "bg-primary",
    progressShadow: "shadow-[0_0_10px_rgba(13,148,136,0.5)]",
    hasPulse: false,
  },
  low: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    badgeText: "Stable",
    aiBox: "bg-slate-50 ring-slate-200",
    aiAccent: "bg-slate-400",
    aiIcon: "text-slate-500",
    aiLabel: "text-slate-600",
    aiText: "text-slate-700",
    progressBar: "bg-teal-400",
    progressShadow: "shadow-[0_0_8px_rgba(45,212,191,0.4)]",
    hasPulse: false,
  },
} as const;

interface PatientCardImprovedProps {
  patient: Patient;
  isExpanded: boolean;
  onExpand: () => void;
  onPatientClick: (id: string) => void;
}

export function PatientCardImproved({
  patient,
  onPatientClick,
}: PatientCardImprovedProps) {
  const [imageError, setImageError] = useState(false);

  const risk = patient.risk_level || "low";
  const config = RISK_CONFIG[risk as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.low;
  const patientName = patient.full_name ?? patient.name ?? "Unknown Patient";
  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(patient.id)}&backgroundColor=0d9488,14b8a6,06b6d4&backgroundType=gradientLinear`;

  const week = patient.gestational_week;
  const progress = Math.min(Math.round((week / 40) * 100), 100);
  const trimester =
    week <= 13 ? "1st Trimester" : week <= 26 ? "2nd Trimester" : "3rd Trimester";

  const aiRecommendation =
    patient.medical_history?.notes || generateAIRecommendation(patient);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (patient.phone_number) window.location.href = `tel:${patient.phone_number}`;
  };

  return (
    <article
      onClick={() => onPatientClick(patient.id)}
      className="group relative bg-white rounded-2xl p-5 ring-1 ring-slate-200/70 shadow-sm hover:shadow-xl hover:ring-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col"
    >
      {/* Risk badge + pulse */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${config.badge}`}
        >
          {config.badgeText}
        </span>
        {config.hasPulse && (
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50" />
        )}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4 mt-1 h-14">
        <div className="relative shrink-0">
          {!imageError ? (
            <Image
              src={avatarUrl}
              alt=""
              width={48}
              height={48}
              unoptimized
              className="w-12 h-12 rounded-full shadow-sm ring-2 ring-white object-cover bg-white"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-primary transition-colors truncate">
            {patientName}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 truncate mt-1">
            ID: {patient.national_id ?? `MG-${patient.id.slice(0, 6).toUpperCase()}`} •
            Age {calculateAge(patient.date_of_birth ?? undefined)}
          </p>
        </div>
      </div>

      {/* AI analysis */}
      <div
        className={`rounded-xl p-3 mb-4 ring-1 relative overflow-hidden ${config.aiBox} min-h-[88px] flex flex-col`}
      >
        <div className={`absolute top-0 left-0 w-1 h-full ${config.aiAccent}`} />
        <div className="flex items-center gap-1.5 mb-2 shrink-0">
          <Sparkles className={`h-3.5 w-3.5 ${config.aiIcon}`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${config.aiLabel}`}
          >
            AI Analysis
          </span>
        </div>
        <p
          className={`text-[12px] leading-relaxed font-medium line-clamp-2 ${config.aiText}`}
        >
          {aiRecommendation}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-4 px-1">
        <div className="flex justify-between text-[11px] mb-2 font-medium h-4 items-center">
          <span className="text-slate-500">Week {week}</span>
          <span className="text-primary font-semibold">{trimester}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full relative ${config.progressBar} ${config.progressShadow} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto h-12">
        <div className="flex -space-x-1.5">
          {["DR", "RN"].map((r) => (
            <div
              key={r}
              className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600 shrink-0"
              title={r === "DR" ? "Primary Care Provider" : "Nurse"}
            >
              {r}
            </div>
          ))}
        </div>

        <div className="flex gap-1.5">
          <button
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
            title="View details"
            onClick={(e) => {
              e.stopPropagation();
              onPatientClick(patient.id);
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          {patient.phone_number && (
            <button
              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
              title="Call patient"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4" />
            </button>
          )}
          {config.hasPulse && (
            <button
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200"
              title="Alert"
              onClick={(e) => e.stopPropagation()}
            >
              <Siren className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function generateAIRecommendation(patient: Patient): string {
  const week = patient.gestational_week;
  const risk = patient.risk_level || "low";

  if (risk === "critical" || risk === "high") {
    return "Elevated risk factors detected. Recommend immediate follow-up and enhanced monitoring protocol.";
  }
  if (risk === "medium") {
    if (week > 24) {
      return "Gestational monitoring indicators present. Weekly check-ins recommended for optimal care.";
    }
    return "Moderate risk factors identified. Regular monitoring and adherence to care plan advised.";
  }
  if (week < 13) {
    return "First trimester progression normal. Routine prenatal care and nutritional guidance on track.";
  }
  if (week < 27) {
    return "Second trimester vitals consistent. Continue current care plan with scheduled follow-ups.";
  }
  return "Third trimester monitoring active. Preparation for delivery phase proceeding as planned.";
}

function calculateAge(dob: string | undefined): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
