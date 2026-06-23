import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateMamaResponse } from "@/lib/generateMamaResponse";
import { assessTriage } from "@/lib/triage";
import { transcribeAudio } from "@/lib/transcribe";
import { generateSpeech } from "@/lib/speak";
import { verifyWhatsAppSignature } from "@/lib/verifyWebhook";
import {
  parseIntent,
  helpMessage,
  stopConfirmMessage,
  startConfirmMessage,
  languageConfirmMessage,
} from "@/lib/conversation";

interface WhatsAppMessage {
  from: string;
  id: string;
  type: string;
  audio?: { id?: string };
  text?: { body?: string };
}

interface WhatsAppWebhookBody {
  entry?: Array<{
    changes?: Array<{ value?: { messages?: WhatsAppMessage[] } }>;
  }>;
}

// Detect appointment confirm/cancel intent in a patient reply and update their
// nearest upcoming visit (Plan 2.1). Conservative: only acts on explicit
// keywords and only when an upcoming scheduled/confirmed visit exists.
const CONFIRM_WORDS = [
  "wakha", "ok", "okay", "oui", "yes", "na3am", "نعم", "واخا", "غادي نجي",
  "ايه", "d'accord", "confirm", "نأكد", "ايوا",
];
const CANCEL_WORDS = [
  "ma neqderch", "ma ghadich", "ma nqderch", "can't", "cannot", "annuler",
  "cancel", "reporter", "reschedule", "ما نقدرش", "ما غاديش", "بدل", "نأجل",
];

async function handleAppointmentIntent(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  patientId: string,
  text: string,
): Promise<void> {
  const t = text.toLowerCase();
  const isConfirm = CONFIRM_WORDS.some((w) => t.includes(w.toLowerCase()));
  const isCancel = CANCEL_WORDS.some((w) => t.includes(w.toLowerCase()));
  if (!isConfirm && !isCancel) return;

  const { data: appt } = await supabase
    .from("appointments")
    .select("id")
    .eq("patient_id", patientId)
    .in("status", ["scheduled", "confirmed"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!appt) return;

  // Cancel takes precedence (safer to surface a cancellation than a false confirm).
  const status = isCancel ? "cancelled" : "confirmed";
  await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", appt.id);
}

/**
 * Background processor handles the Patient's incoming message:
 * 1. Transcribes if audio
 * 2. Saves to DB as role: "user"
 * 3. Updates risk status/alerts
 * 4. Generates and sends AI response
 */
async function processMessageInBackground(body: WhatsAppWebhookBody) {
  const supabase = await createAdminClient();
  
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

    if (!userText.trim()) {
      // Plan E1.3 — never silently drop a failed voice note. Ask the mother to
      // resend (text or clearer audio) and flag urgency-conservatively in copy.
      if (isAudio) {
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
        const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
        if (phoneId && token) {
          await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: senderPhone,
              type: "text",
              text: {
                body:
                  "Sme7 liya 🎙️ ma fhemtch l-message dyalek b s-sout mzyan. 3afak 3awd sift-u b chwiya o b wodo7, wla ktbha liya. Ila 7essiti b chi 7aja musta3jala (bhal nazif, wja3 qwi...), sir l aqrab sbitar daba.",
              },
            }),
          });
        }
      }
      return;
    }

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

    // --- 2b. COMMAND INTENTS (STOP / HELP / language) — Plan E2.1/E2.2/E6.1 ---
    // Short command messages are handled before triage. Long messages that merely
    // contain a command word fall through to triage (safety).
    {
      const intent = parseIntent(userText);
      if (intent.kind !== "message") {
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
        const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
        const reply = async (body: string) => {
          if (!phoneId || !token) return;
          await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: senderPhone,
              type: "text",
              text: { body },
            }),
          });
        };
        if (intent.kind === "stop") {
          await supabase
            .from("patients")
            .update({ consent_given: false, updated_at: new Date().toISOString() })
            .eq("id", currentPatient.id);
          await reply(stopConfirmMessage());
          return;
        }
        if (intent.kind === "start") {
          await supabase
            .from("patients")
            .update({ consent_given: true, consent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("id", currentPatient.id);
          await reply(startConfirmMessage());
          return;
        }
        if (intent.kind === "help") {
          await reply(helpMessage());
          return;
        }
        if (intent.kind === "language") {
          await supabase
            .from("patients")
            .update({ language: intent.language, updated_at: new Date().toISOString() })
            .eq("id", currentPatient.id);
          await reply(languageConfirmMessage(intent.language));
          return;
        }
      }
    }

    // --- 3. RISK ANALYSIS & DB SAVE (AS PATIENT/USER) ---
    // Validated, deterministic, conservative triage (WHO ANC DAK — Plan 1.1).
    // Postpartum patients (Phase 3) also get postpartum-specific danger signs.
    const triage = assessTriage(userText, {
      postpartum: Boolean(currentPatient.postpartum),
    });

    // Save the Patient's message (The "User" role). Persist the full triage
    // assessment for auditability (version, matched signs, escalation).
    const { data: savedPatientMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: conv!.id,
        role: "user", // Correctly save as patient
        content: userText,
        metadata: {
          wamid,
          risk: triage.urgency,
          source: isAudio ? "voice_note" : "text",
          triage_version: triage.version,
          triage_signs: triage.signs.map((s) => s.id),
          triage_escalated: triage.escalated,
        },
      })
      .select().single();

    // Update health resume and risk status. risk_level is set from the RULE
    // engine only — the LLM reply layer can never downgrade it.
    const detected = triage.signs.length
      ? triage.signs.map((s) => s.label).join(", ")
      : "No danger signs detected";
    const stateResume = `Check-in: ${new Date().toLocaleDateString()} - Detected: ${detected}. Urgency: ${triage.urgency}`;

    await supabase.from("patients").update({
      risk_level: triage.urgency,
      medical_history: {
        ...(typeof currentPatient.medical_history === 'object' ? currentPatient.medical_history : {}),
        last_resume: stateResume
      }
    }).eq("id", currentPatient.id);

    // Trigger an alert for any non-low urgency. high/critical = act-now queue
    // (SLA); medium = "needs review" bucket (human-in-the-loop on ambiguity).
    if (triage.urgency !== "low") {
      const signLabel = triage.signs.map((s) => s.label).join(", ") || triage.symptom;
      await supabase.from("alerts").insert({
        patient_id: currentPatient.id,
        message_id: savedPatientMsg!.id,
        urgency: triage.urgency,
        symptom_name: signLabel,
      });

      // Notify clinicians for act-now urgencies (Plan E1.1).
      if (triage.urgency === "high" || triage.urgency === "critical") {
        const who = currentPatient.full_name || currentPatient.name || "A patient";
        await supabase.from("notifications").insert({
          type: triage.urgency === "critical" ? "alert_critical" : "alert_high",
          title: `${triage.urgency === "critical" ? "🚨 Critical" : "⚠️ High"} alert — ${who}`,
          body: signLabel || "Danger sign detected",
          entity_type: "alert",
          patient_id: currentPatient.id,
        });
      }
    }

    // Appointment confirm / cancel intent from the patient's reply (Plan 2.1).
    await handleAppointmentIntent(supabase, currentPatient.id, userText);

    // Plan 2.4 — partner/family engagement. On a NEW critical escalation (edge,
    // not repeated), and only with the mother's consent, notify the trusted
    // partner so family can help her reach care. Privacy-conscious: no medical
    // detail is shared, just an urgent request to assist. Non-fatal on failure.
    const becameCritical =
      triage.urgency === "critical" && currentPatient.risk_level !== "critical";
    if (
      becameCritical &&
      currentPatient.partner_opt_in &&
      currentPatient.spouse_partner_phone &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN
    ) {
      const motherName = currentPatient.full_name || currentPatient.name || "l-mama";
      const partnerMsg = `Salam 🧸. Hada blagh mosta3jal mn Mama AI bekhsous ${motherName}. Ymken t7taj mosa3ada s7iya daba. 3afak tssl biha w 3awnha bach toussel l aqrab sbitar wla qabla. Choukran 3la l-mosa3ada dyalk. 🇲🇦`;
      try {
        await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: String(currentPatient.spouse_partner_phone).replace(/\D/g, ""),
            type: "text",
            text: { body: partnerMsg },
          }),
        });
      } catch (partnerErr) {
        console.error("[Webhook] Partner notification failed:", partnerErr);
      }
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
      risk_level: triage.urgency,
      gestational_week: currentPatient.gestational_week,
      postpartum: Boolean(currentPatient.postpartum),
      language: currentPatient.language,
      chat_history: historyString,
    });

    // --- 5. SEND TO WHATSAPP & SAVE AI REPLY ---
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

    let audioMediaId: string | null = null;

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

      // Also send a Darija voice note when ElevenLabs is configured.
      // Text was already delivered above, so any failure here is non-fatal.
      const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
      const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
      if (elevenKey && voiceId && !elevenKey.startsWith("your_") && !voiceId.startsWith("your_")) {
        try {
          const speech = await generateSpeech(aiResponse);

          // 1. Upload the audio to WhatsApp media to get a reusable media id.
          const form = new FormData();
          form.append("messaging_product", "whatsapp");
          form.append(
            "file",
            new Blob([new Uint8Array(speech)], { type: "audio/mpeg" }),
            "reply.mp3",
          );
          form.append("type", "audio/mpeg");
          const uploadRes = await fetch(
            `https://graph.facebook.com/v18.0/${phoneId}/media`,
            { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form },
          );
          const uploadData = await uploadRes.json();
          audioMediaId = uploadData?.id ?? null;

          // 2. Send the voice note referencing that media id.
          if (audioMediaId) {
            await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: senderPhone,
                type: "audio",
                audio: { id: audioMediaId },
              }),
            });
          }
        } catch (voiceErr) {
          console.error("[Webhook] Voice reply failed:", voiceErr);
        }
      }
    }

    // Save the AI's response to DB (role: assistant)
    await supabase.from("messages").insert({
      conversation_id: conv!.id,
      role: "assistant",
      content: aiResponse,
      metadata: audioMediaId ? { voice: true, audio_media_id: audioMediaId } : null,
    });

  } catch (error) {
    console.error("🔥 Webhook Background Error:", error);
  }
}

export async function POST(request: NextRequest) {
  // Read the raw body so we can verify Meta's HMAC signature (production security).
  const raw = await request.text();
  if (!verifyWhatsAppSignature(raw, request.headers.get("x-hub-signature-256"))) {
    console.error("[Webhook] Invalid X-Hub-Signature-256");
    return new NextResponse("Invalid signature", { status: 401 });
  }
  let body;
  try {
    body = JSON.parse(raw);
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