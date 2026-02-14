import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type SendBody =
  | { conversationId: string; patientId?: string; message: string }
  | { to: string; message: string };

export async function POST(request: NextRequest) {
  let body: SendBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawContent = typeof body.message === "string" ? body.message.trim() : "";
  if (!rawContent) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // Doctor message: same WhatsApp send logic as webhook (body is doctor-written, not AI-generated)
  const labeledWhatsAppContent = `👨‍⚕️ [Risala min tbib]:\n\n${rawContent}`;

  const supabase = await createClient();
  const rawToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const rawPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = rawToken?.trim();
  const phoneId = rawPhoneId?.trim();

  const WHATSAPP_TIMEOUT_MS = 10000;

  const performWhatsAppSend = async (toNumber: string) => {
    if (!phoneId || !token) {
      console.error("[whatsapp/send] WhatsApp credentials missing in .env");
      return;
    }

    const to = toNumber.replace(/\D/g, "");
    const whatsappUrl = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WHATSAPP_TIMEOUT_MS);

    try {
      console.log(`[WhatsApp] Attempting to send message to ${to}...`);
      const whatsappResponse = await fetch(whatsappUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body: labeledWhatsAppContent },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!whatsappResponse.ok) {
        const errorDetail = await whatsappResponse.json().catch(() => ({}));
        console.error("WhatsApp API Error:", whatsappResponse.status, JSON.stringify(errorDetail, null, 2));
      } else {
        console.log("✅ Message successfully delivered to WhatsApp!");
      }
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId);
      console.error("CRITICAL NETWORK ERROR: Fetch to WhatsApp failed.", fetchErr instanceof Error ? fetchErr.message : fetchErr);
    }
  };
  // CASE 1: Legacy Registration Welcome (Direct number)
  if ("to" in body) {
    // We don't await this so the response returns instantly to the frontend
    performWhatsAppSend(body.to);
    return NextResponse.json({ success: true });
  }

  // CASE 2: Dashboard Doctor-to-Patient Message
  const { conversationId, patientId } = body;
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  // 2. Save original message to Supabase (Dashboard displays the raw text without the label)
  const { data: savedMessage, error: insertError } = await supabase
    .from("messages")
    .insert({ 
      conversation_id: conversationId, 
      role: "assistant", 
      content: rawContent, // Saved as raw text for the dashboard view
      metadata: { source: "doctor_dashboard" } // Tag it so UI knows it was a doctor
    })
    .select("id, content, created_at")
    .single();

  if (insertError) {
    console.error("[whatsapp/send] DB Insert error:", insertError);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }

  // 3. Trigger background send to WhatsApp if patientId exists
  if (patientId) {
    const { data: patient } = await supabase
      .from("patients")
      .select("phone_number")
      .eq("id", patientId)
      .single();
      
    if (patient?.phone_number) {
      // Background execution: The route returns 200 immediately, performWhatsAppSend runs in parallel
      performWhatsAppSend(patient.phone_number);
    }
  }

  return NextResponse.json({
    success: true,
    message: savedMessage,
  });
}