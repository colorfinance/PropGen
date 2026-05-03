/**
 * Minimal HMAC-signed session cookie for the admin gate.
 * v1 uses a single shared password; v2 will replace this with Supabase Auth.
 *
 * Token format:  base64url("<expMs>.<hex(hmac-sha256(payload, secret))>")
 * Payload:       "autopost-admin.<expMs>"
 *
 * Uses Web Crypto so it works in both edge middleware and Node route handlers.
 */

export const ADMIN_COOKIE_NAME = "autopost_admin_session";
export const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const TOKEN_LABEL = "autopost-admin";
const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let hex = "";
  for (let i = 0; i < view.length; i += 1) {
    hex += view[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function base64UrlEncode(value: string): string {
  const b64 =
    typeof btoa === "function"
      ? btoa(value)
      : Buffer.from(value, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string | null {
  try {
    const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  } catch {
    return null;
  }
}

async function hmacSha256Hex(
  payload: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToHex(sig);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function issueAdminToken(
  secret: string,
  ttlSeconds: number = ADMIN_COOKIE_MAX_AGE_SECONDS,
): Promise<string> {
  const expMs = Date.now() + ttlSeconds * 1000;
  const payload = `${TOKEN_LABEL}.${expMs}`;
  const sig = await hmacSha256Hex(payload, secret);
  return base64UrlEncode(`${expMs}.${sig}`);
}

export async function verifyAdminToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const decoded = base64UrlDecode(token);
  if (!decoded) return false;
  const dot = decoded.indexOf(".");
  if (dot <= 0) return false;
  const expRaw = decoded.slice(0, dot);
  const sig = decoded.slice(dot + 1);
  const expMs = Number(expRaw);
  if (!Number.isFinite(expMs) || expMs <= Date.now()) return false;
  const expected = await hmacSha256Hex(`${TOKEN_LABEL}.${expMs}`, secret);
  return constantTimeEqual(sig, expected);
}
