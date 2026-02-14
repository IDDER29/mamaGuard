export async function generateSpeech(text: string): Promise<Buffer> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2", // Best for Arabic/French mix
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );
  
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }