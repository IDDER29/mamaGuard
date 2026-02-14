"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DashboardPatient } from "@/types";

interface PatientCardProps {
  patient: DashboardPatient;
}

// Ensure every potential string key has a mapping, 
// including old schema values like 'stable' or 'normal'
const RISK_COLORS: Record<string, { border: string; badge: string; indicator: string; chart: string }> = {
  low: {
    border: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    indicator: "bg-emerald-500",
    chart: "#10b981",
  },
  medium: {
    border: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    indicator: "bg-amber-500",
    chart: "#f59e0b",
  },
  high: {
    border: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    indicator: "bg-orange-500",
    chart: "#ea580c",
  },
  critical: {
    border: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-100",
    indicator: "bg-red-500",
    chart: "#ef4444",
  },
  // Fallbacks for older data
  stable: {
    border: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    indicator: "bg-emerald-500",
    chart: "#10b981",
  },
  normal: {
    border: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    indicator: "bg-blue-500",
    chart: "#3b82f6",
  },
};

function formatPhoneDisplay(phoneNumber: string): string {
  if (!phoneNumber) return "";
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.startsWith("212") && digits.length >= 12) {
    return `+212 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

export default function PatientCard({ patient }: PatientCardProps) {
  const router = useRouter();
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [isDispatchLoading, setIsDispatchLoading] = useState(false);

  // Fallback to 'low' if risk_level is undefined or not in the map
  const riskKey = (patient.risk_level || "low").toLowerCase();
  const colors = RISK_COLORS[riskKey] || RISK_COLORS.low;
  
  const displayName = patient.full_name || patient.name || "";
  const isHighRisk = riskKey === "high" || riskKey === "critical";
  
  const medicalNotes = patient.medical_history?.notes;
  const alertMessage = patient.alert?.message ?? "";
  const aiInsightText = medicalNotes
    ? `${alertMessage}${alertMessage ? " • " : ""}${medicalNotes.length > 80 ? medicalNotes.slice(0, 80) + "…" : medicalNotes}`
    : alertMessage;
  const hasEmergency = isHighRisk && (patient.emergency_contact_name || patient.emergency_contact_phone);
  const hasGestation = patient.gestational_week != null || patient.trimester != null;

  const handleCall = async () => {
    setIsCallLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(`/dashboard/call/${patient.id}`);
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!confirm(`Dispatch emergency services for ${displayName}?`)) return;
    setIsDispatchLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Emergency services have been dispatched.");
    } finally {
      setIsDispatchLoading(false);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex overflow-hidden">
      {/* Risk Indicator Strip */}
      <div className={`w-1.5 ${colors.border} shrink-0`} aria-hidden="true" />

      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4 min-w-0">
        {/* Profile Section */}
        <div className="flex items-start gap-3 w-full md:w-[280px] min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
              {patient.avatarUrl ? (
                 <Image src={patient.avatarUrl} alt="" width={48} height={48} className="object-cover" />
              ) : (
                <span className="text-slate-400 font-bold">{displayName[0]}</span>
              )}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3 h-3 ${colors.indicator} rounded-full border-2 border-white`} />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              <Link href={`/dashboard/patients/${patient.id}`} className="hover:text-sky-600 transition-colors">
                {displayName || "—"}
              </Link>
            </h3>
            <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
              {hasGestation && (
                <p>
                  {patient.trimester != null ? `T${patient.trimester}` : ""}
                  {patient.trimester != null && patient.gestational_week != null ? " • " : ""}
                  {patient.gestational_week != null ? `Week ${patient.gestational_week}` : ""}
                </p>
              )}
              {patient.location_address && (
                <p className="truncate text-slate-400">{patient.location_address}</p>
              )}
              {patient.blood_type && <p>Blood: {patient.blood_type}</p>}
              {patient.phone_number && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{formatPhoneDisplay(patient.phone_number)}</span>
                  {patient.has_smartphone && <span className="text-emerald-600 text-[10px] font-bold uppercase">WhatsApp</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact Quick View — only when we have data */}
        {hasEmergency && (
          <div className="flex-1 min-w-[180px] border-l border-slate-100 pl-4 hidden lg:block">
            <p className="text-[10px] font-semibold uppercase text-slate-400">Emergency Contact</p>
            {patient.emergency_contact_name && (
              <p className="text-sm font-medium text-slate-800 truncate">{patient.emergency_contact_name}</p>
            )}
            {patient.emergency_contact_phone && (
              <a href={`tel:${patient.emergency_contact_phone.replace(/\D/g, "")}`} className="text-xs text-sky-600 hover:underline">
                {formatPhoneDisplay(patient.emergency_contact_phone)}
              </a>
            )}
          </div>
        )}

        {/* Insight Section */}
        <div className="flex-1 min-w-[250px] border-l border-slate-100 pl-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${colors.badge}`}>
              {riskKey}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{patient.alert?.category || "General"}</span>
          </div>
          {(alertMessage || medicalNotes) && (
            <p className="text-sm text-slate-600 line-clamp-2">
              <span className="font-bold text-slate-800">Insight:</span> {aiInsightText || "—"}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={handleCall}
            disabled={isCallLoading}
            className="p-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-2 text-xs font-semibold"
          >
             <span className="material-symbols-outlined text-sm">{isCallLoading ? 'progress_activity' : 'videocam'}</span>
             Call
          </button>
          
          {riskKey === "critical" ? (
            <button
              onClick={handleDispatch}
              disabled={isDispatchLoading}
              className="px-3 py-2 rounded-md bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
            >
              Dispatch
            </button>
          ) : (
            <button
              onClick={() => router.push(`/dashboard/patients/${patient.id}/schedule`)}
              className="px-3 py-2 rounded-md border border-slate-200 text-xs font-semibold hover:bg-slate-50"
            >
              Schedule
            </button>
          )}
        </div>
      </div>
    </article>
  );
}