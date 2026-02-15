import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateMamaResponse } from "@/lib/generateMamaResponse";
import { analyzeSymptomRisk } from "@/lib/symptoms";
import { transcribeAudio } from "@/lib/transcribe";
import { generateSpeech } from "@/lib/speak";

const SUPABASE_PROJECT_URL_REGEX = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?/;

/**
 * Background processor handles the Patient's incoming message:
 * 1. Transcribes if audio
 * 2. Saves to DB as role: "user"
 * 3. Updates risk status/alerts
 * 4. Generates and sends AI response
 */
async function processMessageInBackground(body: any) {
  const supabase = await createClient();
  
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const messageObj = change?.value?.messages?.[0];

    if (!messageObj) return;

    const senderPhone = messageObj.from;
    const wamid = messageObj.id;
    const isAudio = messageObj.type === "audio";
    let userText = "";

    // --- 1. HANDLE PATIENT INPUT (Audio or Text) ---
    if (isAudio) {
      try {
        const audioId = messageObj.audio?.id;
        const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
        const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${audioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mediaData = await mediaRes.json();
        
        if (mediaData.url) {
          const fileRes = await fetch(mediaData.url, { headers: { Authorization: `Bearer ${token}` } });
          const buffer = Buffer.from(await fileRes.arrayBuffer());
          userText = await transcribeAudio(buffer); // Save transcription for DB
        }
      } catch (err) {
        console.error("[Webhook] Transcription failed:", err);
      }
    } else {
      userText = messageObj.text?.body ?? "";
    }

    if (!userText.trim()) return;

    // --- 2. DEDUPLICATION & PATIENT FETCH ---
    const { data: existingMsg } = await supabase
      .from("messages")
      .select("id")
      .filter("metadata->>wamid", "eq", wamid)
      .maybeSingle();

    if (existingMsg) return;

    // Find patient by phone
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("phone_number", senderPhone)
      .maybeSingle();

    let currentPatient = patient;
    if (!currentPatient) {
      const { data: newP } = await supabase
        .from("patients")
        .insert({ phone_number: senderPhone, name: "New Mother", risk_level: "low" })
        .select().single();
      currentPatient = newP;
    }

    // Ensure Conversation exists
    let { data: conv } = await supabase
      .from("conversations")
      .select("id")
      .eq("patient_id", currentPatient.id)
      .maybeSingle();

    if (!conv) {
      const { data: newC } = await supabase
        .from("conversations")
        .insert({ patient_id: currentPatient.id })
        .select().single();
      conv = newC;
    }

    // --- 3. RISK ANALYSIS & DB SAVE (AS PATIENT/USER) ---
    const risk = analyzeSymptomRisk(userText);
    
    // Save the Patient's message (The "User" role)
    const { data: savedPatientMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: conv!.id,
        role: "user", // Correctly save as patient
        content: userText,
        metadata: { wamid, risk: risk.urgency, source: isAudio ? "voice_note" : "text" }
      })
      .select().single();

    // Update health resume and risk status
    const stateResume = `Check-in: ${new Date().toLocaleDateString()} - AI detected: ${risk.symptom || 'Normal update'}. Urgency: ${risk.urgency}`;
    
    await supabase.from("patients").update({ 
      risk_level: risk.urgency,
      medical_history: { 
        ...(typeof currentPatient.medical_history === 'object' ? currentPatient.medical_history : {}),
        last_resume: stateResume
      }
    }).eq("id", currentPatient.id);

    // Trigger alert record for high/critical
    if (risk.urgency === "high" || risk.urgency === "critical") {
      await supabase.from("alerts").insert({
        patient_id: currentPatient.id,
        message_id: savedPatientMsg!.id,
        urgency: risk.urgency,
        symptom_name: risk.symptom
      });
    }

    // --- 4. FETCH CONTEXT & GENERATE AI RESPONSE ---
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conv!.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const historyString = history ? [...history].reverse().map(m => `${m.role}: ${m.content}`).join("\n") : "";

    const aiResponse = await generateMamaResponse(userText, {
      name: currentPatient.full_name || currentPatient.name,
      risk_level: risk.urgency,
      gestational_week: currentPatient.gestational_week,
      chat_history: historyString,
    });

    // --- 5. SEND TO WHATSAPP & SAVE AI REPLY ---
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

    if (phoneId && token) {
      // Send text reply to patient
      await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: senderPhone,
          text: { body: aiResponse },
        }),
      });
    }

    // Save the AI's response to DB (role: assistant)
    await supabase.from("messages").insert({
      conversation_id: conv!.id,
      role: "assistant",
      content: aiResponse
    });

  } catch (error) {
    console.error("🔥 Webhook Background Error:", error);
  }
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const isMessage = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (isMessage) {
    // Return 200 OK immediately so Meta doesn't timeout
    processMessageInBackground(body);
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 200 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("hub.verify_token") === process.env.VERIFY_TOKEN) {
    return new NextResponse(searchParams.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}