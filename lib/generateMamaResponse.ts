// lib/generateMamaResponse.ts
// Supports OpenAI (GPT-4o etc.) or MiniMax. Set OPENAI_API_KEY to use OpenAI.

import { buildGroundingBlock } from "@/lib/content";

const MAMA_SYSTEM_BASE = `You are Mama AI, a warm and supportive Moroccan pregnancy assistant. 
You speak fluently in Darija (Moroccan Arabic) and make pregnant people feel heard and safe.

Your role:
- Answer questions about pregnancy, nutrition, rest, and well-being in a caring way.
- Use Darija naturally; you may mix in French or standard Arabic when it fits.
- Never replace medical advice—encourage users to see a doctor or midwife when needed.
- Be reassuring, culturally aware, and respectful of Moroccan family and health practices.

CLINICAL SAFETY (non-negotiable):
- A separate clinical triage system determines the patient's risk level. NEVER
  downplay, dismiss, or tell a patient her situation is "not serious" or to
  "wait and see" when she reports danger signs.
- If the current risk level is high or critical, OR she mentions bleeding,
  severe headache, blurred vision, convulsions, the baby not moving, severe
  abdominal pain, fever, or leaking fluid, you MUST urge her to seek care at a
  clinic/hospital immediately and (if relevant) contact emergency services.
- Do not give a diagnosis. When in doubt, advise seeking professional care.

Keep responses clear, concise, and supportive.`;

// Plan 4.5 — multilingual routing. The persona defaults to Darija; the patient's
// `language` selects the reply language end-to-end.
const LANGUAGE_INSTRUCTION = {
  darija: "Respond in Moroccan Darija (Latin or Arabic script is fine).",
  arabic: "Respond in Modern Standard Arabic.",
  french: "Réponds en français, avec chaleur et clarté.",
  amazigh: "Respond in Tamazight (Amazigh). Use Latin script if needed.",
  english: "Respond in English.",
} as const;

function languageDirective(language?: string): string {
  const key = (language ?? "").toLowerCase();
  if (key.startsWith("fr")) return LANGUAGE_INSTRUCTION.french;
  if (key.startsWith("en")) return LANGUAGE_INSTRUCTION.english;
  if (key.startsWith("am") || key.startsWith("tzm") || key.includes("tama") || key.includes("amazigh"))
    return LANGUAGE_INSTRUCTION.amazigh;
  if (key === "arabic" || key === "msa" || key === "ar") return LANGUAGE_INSTRUCTION.arabic;
  return LANGUAGE_INSTRUCTION.darija;
}

const FALLBACK_DARIJA =
  "Ana smahiti, ma tqderch t7awl daba. Ila bghiti, 3awed t7awel w goli b 7aloha. Baraka min fadlik tsajli m3a tabiba wla qabla 7ta tqder t7awl m3ahum.";

export type PatientContext = {
  name?: string;
  gestational_week?: number;
  risk_level?: string;
  doctor_notes?: string;
  chat_history?: string;
  /** Patient language for reply routing (Plan 4.5). */
  language?: string;
  [key: string]: string | number | boolean | undefined;
};

/** Build system instructions including patient context, doctor notes, and conversation history. */
function buildSystemPrompt(patientContext: PatientContext, message: string): string {
  const { doctor_notes, chat_history, name, risk_level, gestational_week } = patientContext;
  const language = typeof patientContext.language === "string" ? patientContext.language : undefined;
  const parts = [MAMA_SYSTEM_BASE, `\nLANGUAGE: ${languageDirective(language)}`];

  // Plan 2.3 — ground the reply in the vetted content library (week guidance +
  // matched topics). Prefer this knowledge; never contradict it. Postpartum
  // mode (Phase 3) swaps gestational guidance for postpartum guidance.
  const grounding = buildGroundingBlock(
    message,
    typeof gestational_week === "number" ? gestational_week : null,
    { postpartum: patientContext.postpartum === true },
  );
  if (grounding) {
    parts.push(
      "\n--- TRUSTED KNOWLEDGE BASE (vetted Darija guidance — prefer this, do not contradict it) ---",
    );
    parts.push(grounding);
  }

  const contextParts: string[] = [];
  if (name) contextParts.push(`Patient name: ${name}`);
  if (gestational_week != null) contextParts.push(`Gestational week: ${gestational_week}`);
  if (risk_level) contextParts.push(`Current risk level: ${risk_level}`);
  if (doctor_notes) contextParts.push(`Doctor / clinical notes: ${doctor_notes}`);
  if (chat_history?.trim()) {
    contextParts.push(`Recent conversation (use for continuity):\n${chat_history.trim()}`);
  }

  if (contextParts.length > 0) {
    parts.push("\n--- Current context (use this to personalize your reply) ---");
    parts.push(contextParts.join("\n"));
  }

  return parts.join("\n");
}

/** User prompt is only the latest message. */
function buildUserPrompt(message: string): string {
  return message.trim();
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  console.log("[Mama AI] Using OpenAI, model:", model);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  console.log("[Mama AI] OpenAI response status:", response.status);

  if (!response.ok) {
    const errText = await response.text();
    console.error("[Mama AI] OpenAI API error:", response.status, errText.slice(0, 500));
    throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (content) {
    console.log("[Mama AI] OpenAI returned content, length:", content.length);
    return content;
  }
  if (data.error?.message) {
    console.error("[Mama AI] OpenAI response error field:", data.error.message);
  }
  console.warn("[Mama AI] OpenAI empty content, using fallback");
  return FALLBACK_DARIJA;
}

async function callMiniMax(systemPrompt: string, userPrompt: string): Promise<string> {
  const model = process.env.MINIMAX_MODEL ?? "abab6.5s-chat";
  console.log("[Mama AI] Using MiniMax, model:", model);

  const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  console.log("[Mama AI] MiniMax response status:", response.status);

  if (!response.ok) {
    const errText = await response.text();
    console.error("[Mama AI] MiniMax API error:", response.status, errText.slice(0, 500));
    throw new Error(`MiniMax API error: ${response.status} - ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    base_resp?: { status_code?: number; status_msg?: string };
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (content) {
    console.log("[Mama AI] MiniMax returned content, length:", content.length);
    return content;
  }
  if (data.base_resp?.status_code !== undefined && data.base_resp.status_code !== 0) {
    console.warn("[Mama AI] MiniMax API non-zero status:", data.base_resp.status_msg ?? data.base_resp.status_code);
  } else {
    console.warn("[Mama AI] MiniMax empty content, raw keys:", Object.keys(data).join(", "));
  }
  console.warn("[Mama AI] Using fallback response");
  return FALLBACK_DARIJA;
}

export async function generateMamaResponse(
  message: string,
  patientContext: PatientContext = {}
): Promise<string> {
  console.log("[Mama AI] generateMamaResponse called, message length:", message.length, "context keys:", Object.keys(patientContext).join(", ") || "none");
  const systemPrompt = buildSystemPrompt(patientContext, message);
  const userPrompt = buildUserPrompt(message);

  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(systemPrompt, userPrompt);
    } catch (err) {
      console.error("[Mama AI] callOpenAI failed:", err instanceof Error ? err.message : String(err));
      throw err;
    }
  }
  if (process.env.MINIMAX_API_KEY) {
    try {
      return await callMiniMax(systemPrompt, userPrompt);
    } catch (err) {
      console.error("[Mama AI] callMiniMax failed:", err instanceof Error ? err.message : String(err));
      throw err;
    }
  }
  console.error("[Mama AI] No OPENAI_API_KEY or MINIMAX_API_KEY set");
  throw new Error(
    "Set OPENAI_API_KEY or MINIMAX_API_KEY in environment variables."
  );
}
