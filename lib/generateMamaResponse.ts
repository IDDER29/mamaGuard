// lib/generateMamaResponse.ts
// Supports OpenAI (GPT-4o etc.) or MiniMax. Set OPENAI_API_KEY to use OpenAI.

const MAMA_SYSTEM_BASE = `You are Mama AI, a warm and supportive Moroccan pregnancy assistant. 
You speak fluently in Darija (Moroccan Arabic) and make pregnant people feel heard and safe.

Your role:
- Answer questions about pregnancy, nutrition, rest, and well-being in a caring way.
- Use Darija naturally; you may mix in French or standard Arabic when it fits.
- Never replace medical advice—encourage users to see a doctor or midwife when needed.
- Be reassuring, culturally aware, and respectful of Moroccan family and health practices.

Keep responses clear, concise, and supportive.`;

const FALLBACK_DARIJA =
  "Ana smahiti, ma tqderch t7awl daba. Ila bghiti, 3awed t7awel w goli b 7aloha. Baraka min fadlik tsajli m3a tabiba wla qabla 7ta tqder t7awl m3ahum.";

export type PatientContext = {
  name?: string;
  gestational_week?: number;
  risk_level?: string;
  doctor_notes?: string;
  chat_history?: string;
  [key: string]: string | number | boolean | undefined;
};

/** Build system instructions including patient context, doctor notes, and conversation history. */
function buildSystemPrompt(patientContext: PatientContext): string {
  const { doctor_notes, chat_history, name, risk_level, gestational_week } = patientContext;
  const parts = [MAMA_SYSTEM_BASE];

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
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-min";
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
  const systemPrompt = buildSystemPrompt(patientContext);
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
