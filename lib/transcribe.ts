// lib/transcribe.ts
// Darija (Moroccan Arabic) speech-to-text via OpenAI Whisper. WhatsApp voice
// notes arrive as OGG/Opus. Plan 1.4 hardening:
//  - forced Arabic + a Darija medical-vocabulary prompt to bias recognition
//  - explicit error handling (never silently swallow non-2xx)
//  - retry with backoff on transient (network / 5xx) failures
//  - guard against Whisper's well-known silence hallucinations

// Priming prompt: nudges Whisper toward Moroccan Darija and the danger-sign
// vocabulary the triage engine cares about, so transcriptions stay clinical.
const DARIJA_PROMPT =
  "محادثة مع امرأة حامل بالدارجة المغربية على صحتها والحمل. " +
  "كلمات مهمة: نزيف، الدم، صداع قوي، تقلصات، الجنين ما كيتحركش، حمى، سخانة، " +
  "السائل، الماء نزل، الضغط، دوخة، تقيؤ، البطن كيوجعني، الرؤية مشوشة.";

// Phrases Whisper commonly hallucinates over silence/noise; if the whole
// transcript is just one of these, treat it as empty.
const HALLUCINATION_PATTERNS = [
  /^(thanks? for watching\.?)$/i,
  /^(thank you\.?)$/i,
  /^(please subscribe.*)$/i,
  /^(اشترك.*)$/, // "اشترك" (subscribe)
  /^[.،\s]*$/, // only punctuation/whitespace
];

interface WhisperVerboseResponse {
  text?: string;
  segments?: Array<{ no_speech_prob?: number; text?: string }>;
}

function isLikelyHallucination(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return HALLUCINATION_PATTERNS.some((re) => re.test(trimmed));
}

async function requestTranscription(
  audioBuffer: Buffer,
  apiKey: string,
  language: string,
): Promise<Response> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/ogg" });
  formData.append("file", blob, "audio.ogg");
  formData.append("model", "whisper-1");
  formData.append("language", language); // Forced language helps low-resource dialects
  formData.append("prompt", DARIJA_PROMPT);
  formData.append("temperature", "0");
  formData.append("response_format", "verbose_json"); // gives us no_speech_prob

  return fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });
}

/** Map a patient language to a Whisper ISO language code (defaults to Arabic). */
function whisperLang(language?: string): string {
  const key = (language ?? "").toLowerCase();
  if (key.startsWith("fr")) return "fr";
  if (key.startsWith("en")) return "en";
  return "ar"; // Darija / Arabic / Amazigh transcribe best under Arabic
}

/**
 * Transcribe a WhatsApp voice note to text. Returns "" on failure or when the
 * audio is silence/noise — callers already treat empty as "ignore". Pass the
 * patient language (Plan 4.5) to route non-Arabic speakers correctly.
 */
export async function transcribeAudio(audioBuffer: Buffer, language?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[transcribe] OPENAI_API_KEY is not set");
    return "";
  }
  const lang = whisperLang(language);

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await requestTranscription(audioBuffer, apiKey, lang);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        console.error(`[transcribe] Whisper error ${response.status}:`, errText.slice(0, 300));
        // Retry only transient server errors / rate limits; bail on 4xx.
        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
            continue;
          }
        }
        return "";
      }

      const data = (await response.json()) as WhisperVerboseResponse;
      const text = (data.text ?? "").trim();

      // Reject transcripts that are almost certainly silence hallucinations.
      const segs = data.segments ?? [];
      const allSilence =
        segs.length > 0 && segs.every((s) => (s.no_speech_prob ?? 0) > 0.6);
      if (allSilence || isLikelyHallucination(text)) {
        console.warn("[transcribe] Dropped likely silence/hallucination transcript");
        return "";
      }

      console.log("[transcribe] OK, length:", text.length);
      return text;
    } catch (err) {
      console.error(`[transcribe] attempt ${attempt} failed:`, err instanceof Error ? err.message : String(err));
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
        continue;
      }
    }
  }

  return "";
}
