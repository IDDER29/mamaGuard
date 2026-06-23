import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Production health check for uptime monitors / load balancers. Verifies the
// process is up and the database is reachable. Returns 200 when healthy, 503 otherwise.
export async function GET() {
  const started = Date.now();
  let db: "ok" | "error" = "ok";
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("patients").select("id", { head: true, count: "exact" }).limit(1);
    if (error) db = "error";
  } catch {
    db = "error";
  }
  const healthy = db === "ok";
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", db, latency_ms: Date.now() - started, time: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  );
}
