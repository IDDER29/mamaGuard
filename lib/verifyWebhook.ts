import crypto from "node:crypto";

// Production security: verify Meta's X-Hub-Signature-256 HMAC over the RAW request
// body so only Meta can post to the webhook. Returns true when no app secret is
// configured (keeps local/demo working) — set WHATSAPP_APP_SECRET in production.
export function verifyWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!secret) return true; // not configured → skip (demo/local)
  if (!signatureHeader) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
