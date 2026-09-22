/**
 * Admin session tokens. proxy.ts imports this module, so it stays free of database and
 * Node-only imports and uses Web Crypto only.
 *
 * Cookie value: "<sessionId>.<expiresAtSeconds>.<signature>". The signature is an
 * HMAC-SHA256 of "<sessionId>.<expiresAtSeconds>" keyed with ADMIN_SESSION_SECRET, so a
 * forged or altered cookie is rejected without a database query. The session row itself
 * (AdminSession) is checked by lib/admin/auth.ts on every admin page and server action.
 */

export const ADMIN_SESSION_COOKIE = "kinetus_admin_session";

/** The cookie is only ever sent to /admin routes. */
export const ADMIN_COOKIE_PATH = "/admin";

/** Sessions last seven days, then the admin signs in again. */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Shortest secret accepted: 32 characters. */
const MIN_SECRET_LENGTH = 32;

const encoder = new TextEncoder();

function secret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= MIN_SECRET_LENGTH ? value : null;
}

/** False when ADMIN_SESSION_SECRET is missing or shorter than 32 characters. */
export function isSessionSecretConfigured(): boolean {
  return secret() !== null;
}

async function hmacKey(): Promise<CryptoKey | null> {
  const value = secret();
  if (value === null) {
    return null;
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(value),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) {
    return null;
  }
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

/** A new random session id: 32 bytes, base64url (43 characters). */
export function newSessionId(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

/** Signs a session id and its expiry into the cookie value. */
export async function signSessionToken(sessionId: string, expiresAt: Date): Promise<string> {
  const key = await hmacKey();
  if (key === null) {
    throw new Error("ADMIN_SESSION_SECRET is not set (32 characters or more).");
  }
  const payload = `${sessionId}.${Math.floor(expiresAt.getTime() / 1000)}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Checks the signature and expiry only (no database). Returns the session id, or null for
 * anything malformed, forged, expired or signed with another secret.
 */
export async function verifySessionToken(
  token: string,
  now: number = Date.now(),
): Promise<{ sessionId: string; expiresAt: Date } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [sessionId, expires, signatureText] = parts;
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(sessionId) || !/^\d{1,12}$/.test(expires)) {
    return null;
  }
  const expiresAt = new Date(Number(expires) * 1000);
  if (expiresAt.getTime() <= now) {
    return null;
  }
  const key = await hmacKey();
  const signature = fromBase64Url(signatureText);
  if (key === null || signature === null) {
    return null;
  }
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(`${sessionId}.${expires}`),
  );
  return valid ? { sessionId, expiresAt } : null;
}
