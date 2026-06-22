import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { generateMamaResponse } from "@/lib/generateMamaResponse";

export async function GET(req: Request) {
  // 1. Check for a Secret Header to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = await createAdminClient();

  // 2. Get all patients who need a check-in
  const { data: patients } = await supabase.from("patients").select("*");

  if (!patients) return NextResponse.json({ message: "No patients found" });

  for (const patient of patients) {
    // 3. Generate a personalized, proactive question
    const notes =
      (patient.medical_history && typeof patient.medical_history === "object"
        ? patient.medical_history.notes ?? patient.medical_history.last_resume
        : null) ?? "no specific notes";
    const checkInPrompt = `It is check-in time. This mother is in week ${patient.gestational_week}.
    Based on her notes (${notes}), ask a supportive question in Darija.`;
    
    const message = await generateMamaResponse(checkInPrompt, {
      name: patient.name,
      gestational_week: patient.gestational_week,
      postpartum: Boolean(patient.postpartum),
      language: patient.language,
    });

    // 4. Send via WhatsApp API
    await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: patient.phone_number,
        type: "text",
        text: { body: message },
      }),
    });
  }

  return NextResponse.json({ success: true });
}