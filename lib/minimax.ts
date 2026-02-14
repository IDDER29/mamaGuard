const MINIMAX_API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MAMA_MODEL = "abab6.5s-chat";

const MAMA_SYSTEM_PROMPT = `You are Mama AI, a warm and supportive Moroccan pregnancy assistant. You speak fluently in Darija (Moroccan Arabic) and make pregnant people feel heard and safe.

Your role:
- Answer questions about pregnancy, nutrition, rest, and well-being in a caring way.
- Use Darija naturally; you may mix in French or standard Arabic when it fits.
- Never replace medical advice—encourage users to see a doctor or midwife when needed.
- Be reassuring, culturally aware, and respectful of Moroccan family and health practices.

Keep responses clear, concise, and supportive.`;

export type PatientContext = {
  [key: string]: string | number | boolean | undefined | null;
};

function formatPatientContext(context: PatientContext): string {
  if (Object.keys(context).length === 0) return "";
  const lines = Object.entries(context)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}: ${v}`);
  return lines.length ? `\n\nPatient context:\n${lines.join("\n")}` : "";
}

export async function generateMamaResponse(
  message: string,
  patientContext: PatientContext = {}
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not set");
  }

  const contextBlock = formatPatientContext(patientContext);
  const userContent = contextBlock
    ? `${message}${contextBlock}`
    : message;

  const response = await fetch(MINIMAX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MAMA_MODEL,
      messages: [
        { role: "system", content: MAMA_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`MiniMax API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as {
    base_resp?: { status_code?: number; status_msg?: string };
    choices?: Array<{
      message?: { content?: string };
    }>;
  };

  if (data.base_resp?.status_code !== undefined && data.base_resp.status_code !== 0) {
    throw new Error(
      `MiniMax API error: ${data.base_resp.status_msg ?? data.base_resp.status_code}`
    );
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("MiniMax API returned no text content");
  }

  return content;
}
