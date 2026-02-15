"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Patient } from "@/types";
import { updatePatientFields } from "@/app/actions/patients";

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
}

function formatDate(str: string | null): string {
  if (!str) return "—";
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatMessageTime(str: string): string {
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function PatientDetailClient({
  patient: initialPatient,
  patientId,
  conversationId,
  initialMessages,
}: PatientDetailClientProps) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient>(initialPatient);
  
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
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/patients"
            className="text-slate-500 hover:text-slate-700 p-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={avatarUrl}
                alt=""
                width={36}
                height={36}
                className="rounded-full object-cover border-2 border-slate-200"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  patient.risk_level === "critical" ? "bg-red-500" :
                  patient.risk_level === "high" ? "bg-orange-500" :
                  patient.risk_level === "medium" ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">{displayName}</h1>
              <p className="text-xs text-slate-500">ID: {patientId.slice(0, 8)}…</p>
            </div>
          </div>
        </div>    
      </header>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Clinical card */}
        <aside className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-lg">medical_services</span>
                Clinical
              </h2>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50 transition-colors"
              >
                Edit
              </button>
            </div>
            <ul className="p-4 space-y-4">
              <li>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gestational Week</p>
                <p className="text-slate-900 font-semibold">{patient.gestational_week ?? "—"}</p>
              </li>
              <li>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Type</p>
                <p className="text-slate-900 font-semibold">{patient.blood_type ?? "—"}</p>
              </li>
              <li>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                <p className="text-slate-900 font-semibold">{formatDate(patient.due_date)}</p>
              </li>
              <li>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allergies</p>
                <p className="text-slate-900 font-semibold text-sm">{patient.allergies ?? "None recorded"}</p>
              </li>
            </ul>
          </section>
        </aside>

        {/* Center: Daily summary + Chat */}
        <main className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
          <section className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 shrink-0">
            <h2 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">today</span>
              Today&apos;s summary
            </h2>
            <p className="text-sm text-teal-900">
              Latest risk: <strong className="capitalize">{dailySummaryRisk}</strong>.
              {patient.medical_history?.notes ? ` ${patient.medical_history.notes.slice(0, 100)}${patient.medical_history.notes.length > 100 ? "…" : ""}` : " No recent updates."}
            </p>
          </section>

          <section className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-lg">chat</span>
              <h2 className="text-sm font-semibold text-slate-800">Conversation</h2>
            </div>
            
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
              {messages.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No messages yet.</p>
              )}
              
              {/* No more .reverse() here. We render in array order. */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "bg-slate-100 text-slate-900 rounded-bl-md" // Patient (User)
                        : "bg-teal-500 text-white rounded-br-md"      // Doctor/AI (Assistant)
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.role === "assistant" ? "text-teal-100" : "text-slate-400"}`}>
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {conversationId && (
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sending || !inputValue.trim()}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 text-white font-medium text-sm hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">send</span>
                  )}
                  Send
                </button>
              </div>
            )}
          </section>
        </main>

        {/* Right: Emergency hub */}
        <aside className="w-72 shrink-0">
          <section className="bg-white rounded-xl border-2 border-red-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-lg">emergency</span>
              <h2 className="text-sm font-semibold text-red-900">Emergency Hub</h2>
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
                    className="font-semibold text-teal-600 hover:underline"
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
                className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">emergency</span>
                Trigger Emergency Alert
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !editSaving && setEditOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-patient-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
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
                  className="flex-1 py-2.5 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-50"
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
