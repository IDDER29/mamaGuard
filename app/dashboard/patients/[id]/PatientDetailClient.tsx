"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  CalendarDays,
  CalendarPlus,
  MessagesSquare,
  Send,
  Loader2,
  Siren,
  Pencil,
  Plus,
  Users,
  ShieldCheck,
} from "lucide-react";
import type { Patient } from "@/types";
import { updatePatientFields, updatePartnerInfo } from "@/app/actions/patients";
import {
  createAppointment,
  type AppointmentRow,
} from "@/app/actions/appointments";

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface PatientDetailClientProps {
  patient: Patient;
  patientId: string;
  conversationId: string | null;
  initialMessages: MessageRow[]; // Assumed to be sorted ASC (oldest first) from server
  initialAppointments?: AppointmentRow[];
}

const RISK_BADGE: Record<string, string> = {
  critical: "bg-rose-50 text-rose-700 ring-rose-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const RISK_DOT: Record<string, string> = {
  critical: "bg-rose-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

function formatDate(str: string | null): string {
  if (!str) return "—";
  const d = new Date(str);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatMessageTime(str: string): string {
  const d = new Date(str);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function PatientDetailClient({
  patient: initialPatient,
  patientId,
  conversationId,
  initialMessages,
  initialAppointments = [],
}: PatientDetailClientProps) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [appointments, setAppointments] = useState<AppointmentRow[]>(initialAppointments);
  const [newApptAt, setNewApptAt] = useState("");
  const [newApptLocation, setNewApptLocation] = useState("");
  const [savingAppt, setSavingAppt] = useState(false);

  // Plan 2.4 — partner / family engagement.
  const [partnerName, setPartnerName] = useState(initialPatient.spouse_partner_name ?? "");
  const [partnerPhone, setPartnerPhone] = useState(initialPatient.spouse_partner_phone ?? "");
  const [partnerOptIn, setPartnerOptIn] = useState(initialPatient.partner_opt_in ?? false);
  const [savingPartner, setSavingPartner] = useState(false);

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const handleSavePartner = useCallback(async () => {
    if (savingPartner) return;
    setSavingPartner(true);
    const res = await updatePartnerInfo(patientId, {
      spouse_partner_name: partnerName.trim() || null,
      spouse_partner_phone: partnerPhone.trim() || null,
      partner_opt_in: partnerOptIn,
    });
    setSavingPartner(false);
    if (res.success) {
      setPatient((prev) => ({
        ...prev,
        spouse_partner_name: partnerName.trim() || null,
        spouse_partner_phone: partnerPhone.trim() || null,
        partner_opt_in: partnerOptIn,
      }));
    } else {
      alert(res.error || "Failed to save partner info");
    }
  }, [savingPartner, patientId, partnerName, partnerPhone, partnerOptIn]);

  const handleAddAppointment = useCallback(async () => {
    if (!newApptAt || savingAppt) return;
    setSavingAppt(true);
    const res = await createAppointment({
      patientId,
      scheduledAt: new Date(newApptAt).toISOString(),
      location: newApptLocation.trim() || undefined,
    });
    setSavingAppt(false);
    if (res.success) {
      setNewApptAt("");
      setNewApptLocation("");
      router.refresh();
    } else {
      alert(res.error || "Failed to schedule appointment");
    }
  }, [newApptAt, newApptLocation, savingAppt, patientId, router]);

  // We maintain messages in chronological order (Oldest -> Newest)
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);

  const [editOpen, setEditOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state if server props change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayName = patient.full_name ?? patient.name ?? "—";
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(patient.id)}`;
  const riskKey = patient.risk_level ?? "low";

  const handleSendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || !conversationId || sending) return;

    setSending(true);
    setInputValue("");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          patientId,
          message: text,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.success && data.message) {
        // APPEND to the end of the array to maintain chronological order
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            conversation_id: conversationId,
            role: "assistant",
            content: data.message.content,
            metadata: data.message.metadata || null,
            created_at: data.message.created_at,
          },
        ]);
      } else {
        // Fallback to refresh if API response is unexpected
        router.refresh();
      }
    } catch (err) {
      console.error("Send error:", err);
      router.refresh();
    } finally {
      setSending(false);
    }
  }, [conversationId, patientId, inputValue, sending, router]);

  const handleEditSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const gestational_week = parseInt((form.querySelector('[name="gestational_week"]') as HTMLInputElement)?.value ?? "0", 10);
      const blood_type = (form.querySelector('[name="blood_type"]') as HTMLInputElement)?.value?.trim() || null;
      const due_date = (form.querySelector('[name="due_date"]') as HTMLInputElement)?.value?.trim() || null;
      const allergies = (form.querySelector('[name="allergies"]') as HTMLInputElement)?.value?.trim() || null;

      setEditSaving(true);
      const result = await updatePatientFields(patientId, {
        gestational_week: Number.isNaN(gestational_week) ? undefined : gestational_week,
        blood_type,
        due_date: due_date || null,
        allergies,
      });
      setEditSaving(false);

      if (result.success) {
        setPatient((p) => ({
          ...p,
          gestational_week: Number.isNaN(gestational_week) ? p.gestational_week : gestational_week,
          blood_type,
          due_date: due_date || null,
          allergies,
        }));
        setEditOpen(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to update");
      }
    },
    [patientId, router]
  );

  const latestMessage = messages[messages.length - 1];
  const metaRisk = latestMessage?.metadata && typeof latestMessage.metadata === "object" && "risk" in latestMessage.metadata
    ? (latestMessage.metadata as { risk?: string }).risk
    : undefined;
  const dailySummaryRisk = (typeof metaRisk === "string" && metaRisk) ? metaRisk : patient.risk_level;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top bar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/patients"
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            aria-label="Back to patients"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={avatarUrl}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${RISK_DOT[riskKey] ?? RISK_DOT.low}`}
              />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 leading-tight">{displayName}</h1>
              <p className="text-xs text-slate-500">ID: {patientId.slice(0, 8)}…</p>
            </div>
          </div>
        </div>
        <span
          className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${RISK_BADGE[riskKey] ?? RISK_BADGE.low}`}
        >
          {riskKey} risk
        </span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto lg:overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Clinical card */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4 lg:overflow-y-auto">
          <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Stethoscope className="h-4.5 w-4.5 text-primary" />
                Clinical
              </h2>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
            <ul className="p-4 space-y-4">
              {[
                { label: "Gestational Week", value: patient.gestational_week ?? "—" },
                { label: "Blood Type", value: patient.blood_type ?? "—" },
                { label: "Due Date", value: formatDate(patient.due_date) },
                { label: "Allergies", value: patient.allergies ?? "None recorded" },
              ].map((item) => (
                <li key={item.label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-slate-900 font-semibold text-sm mt-0.5">{item.value}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Appointments (Plan 2.1) */}
          <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <CalendarPlus className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold text-slate-800">Appointments</h2>
            </div>
            <div className="p-4 space-y-3">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500">No appointments scheduled.</p>
              ) : (
                <ul className="space-y-2">
                  {appointments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start justify-between gap-2 text-sm rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {new Date(a.scheduled_at).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {a.location || "—"} · {a.status}
                          {a.reminder_sent_at ? " · reminded" : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <input
                  type="datetime-local"
                  value={newApptAt}
                  onChange={(e) => setNewApptAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
                />
                <input
                  type="text"
                  value={newApptLocation}
                  onChange={(e) => setNewApptLocation(e.target.value)}
                  placeholder="Location (optional)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAppointment}
                  disabled={savingAppt || !newApptAt}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white text-sm font-medium py-2 hover:bg-primary/90 shadow-glow-sm disabled:opacity-50"
                >
                  {savingAppt ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Schedule visit
                </button>
              </div>
            </div>
          </section>

          {/* Family & Partner (Plan 2.4) */}
          <section className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold text-slate-800">Family &amp; Partner</h2>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Partner / family name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
              />
              <input
                type="tel"
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                placeholder="Partner phone (e.g. +212…)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
              />
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={partnerOptIn}
                  onChange={(e) => setPartnerOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  Consent: notify this partner over WhatsApp on a{" "}
                  <span className="font-semibold text-slate-800">critical</span> escalation.
                </span>
              </label>
              <button
                type="button"
                onClick={handleSavePartner}
                disabled={savingPartner}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
              >
                {savingPartner ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Save partner
              </button>
            </div>
          </section>
        </aside>

        {/* Center: Daily summary + Chat */}
        <main className="flex-1 flex flex-col gap-4 min-w-0 lg:overflow-hidden min-h-[70vh] lg:min-h-0">
          <section className="rounded-2xl px-4 py-3.5 shrink-0 bg-gradient-to-r from-primary/[0.08] to-cyan-300/[0.06] ring-1 ring-primary/15">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Today&apos;s summary
            </h2>
            <p className="text-sm text-slate-700">
              Latest risk: <strong className="capitalize text-slate-900">{dailySummaryRisk}</strong>.
              {patient.medical_history?.notes ? ` ${patient.medical_history.notes.slice(0, 100)}${patient.medical_history.notes.length > 100 ? "…" : ""}` : " No recent updates."}
            </p>
          </section>

          <section className="flex-1 bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <MessagesSquare className="h-4.5 w-4.5 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">Conversation</h2>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-slate-50/40">
              {messages.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No messages yet.</p>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      msg.role === "user"
                        ? "bg-white ring-1 ring-slate-200 text-slate-900 rounded-bl-md"
                        : "bg-primary text-white rounded-br-md"
                    }`}
                  >
                    <p dir="auto" className="text-sm whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.role === "assistant" ? "text-white/70" : "text-slate-400"}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {conversationId && (
              <div className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sending || !inputValue.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 disabled:opacity-50 shadow-glow-sm transition-all flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Send className="h-4.5 w-4.5" />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            )}
          </section>
        </main>

        {/* Right: Emergency hub */}
        <aside className="w-full lg:w-72 shrink-0">
          <section className="bg-white rounded-2xl ring-1 ring-rose-200/70 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
              <Siren className="h-4.5 w-4.5 text-rose-600" />
              <h2 className="text-sm font-semibold text-rose-900">Emergency Hub</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact</p>
                <p className="font-semibold text-slate-900">{patient.emergency_contact_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</p>
                {patient.emergency_contact_phone ? (
                  <a
                    href={`tel:${patient.emergency_contact_phone.replace(/\D/g, "")}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {patient.emergency_contact_phone}
                  </a>
                ) : (
                  <p className="text-slate-500">—</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Trigger emergency alert for this patient? This will notify emergency contacts and log the event.")) {
                    alert("Emergency alert triggered. (Implement your notification service here.)");
                  }
                }}
                className="w-full py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Siren className="h-4.5 w-4.5" />
                Trigger Emergency Alert
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => !editSaving && setEditOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-patient-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-patient-title" className="text-lg font-semibold text-slate-900 mb-4">
              Edit clinical details
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-gestational_week" className="block text-xs font-medium text-slate-500 mb-1">
                  Gestational Week
                </label>
                <input
                  id="edit-gestational_week"
                  name="gestational_week"
                  type="number"
                  min={1}
                  max={42}
                  defaultValue={patient.gestational_week}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
                />
              </div>
              <div>
                <label htmlFor="edit-blood_type" className="block text-xs font-medium text-slate-500 mb-1">
                  Blood Type
                </label>
                <input
                  id="edit-blood_type"
                  name="blood_type"
                  type="text"
                  placeholder="e.g. O+"
                  defaultValue={patient.blood_type ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
                />
              </div>
              <div>
                <label htmlFor="edit-due_date" className="block text-xs font-medium text-slate-500 mb-1">
                  Due Date
                </label>
                <input
                  id="edit-due_date"
                  name="due_date"
                  type="date"
                  defaultValue={patient.due_date ? patient.due_date.slice(0, 10) : ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
                />
              </div>
              <div>
                <label htmlFor="edit-allergies" className="block text-xs font-medium text-slate-500 mb-1">
                  Allergies
                </label>
                <textarea
                  id="edit-allergies"
                  name="allergies"
                  rows={2}
                  defaultValue={patient.allergies ?? ""}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/15 outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => !editSaving && setEditOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
