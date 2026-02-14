import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { normalizePatient } from "@/lib/patients";
import { PatientDetailClient } from "./PatientDetailClient";

export interface ConversationRow {
  id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patientRow, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (patientError || !patientRow) {
    notFound();
  }

  const patient = normalizePatient(patientRow as Record<string, unknown>);

  let conversation: ConversationRow | null = null;
  const { data: convList } = await supabase
    .from("conversations")
    .select("id, patient_id, created_at, updated_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (convList?.[0]) {
    conversation = convList[0] as ConversationRow;
  } else {
    const { data: newConv, error: createErr } = await supabase
      .from("conversations")
      .insert({ patient_id: id })
      .select("id, patient_id, created_at, updated_at")
      .single();
    if (!createErr && newConv) {
      conversation = newConv as ConversationRow;
    }
  }

  let messages: MessageRow[] = [];
  if (conversation) {
    const { data: msgList } = await supabase
      .from("messages")
      .select("id, conversation_id, role, content, metadata, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false });
    messages = (msgList ?? []).map((m) => m as MessageRow);
  }

  const conversationId = conversation?.id ?? null;

  return (
    <PatientDetailClient
      patient={patient}
      patientId={id}
      conversationId={conversationId}
      initialMessages={messages}
    />
  );
}
