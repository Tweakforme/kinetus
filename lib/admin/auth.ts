import { compare, hash } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  ADMIN_COOKIE_PATH,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  newSessionId,
  signSessionToken,
  verifySessionToken,
} from "./session";

/**
 * Server-side admin authentication: the data access layer every admin page and server
 * action goes through. proxy.ts only checks the cookie's signature and expiry; this checks
 * the session row, so a logout or password reset takes effect immediately.
 */

export const LOGIN_PATH = "/admin/login";
/** Where /admin and a fresh sign-in land: orders, so a new one is seen first. */
export const ADMIN_HOME = "/admin/orders";

export type AdminIdentity = { id: string; email: string; sessionId: string };

/** The signed-in admin for this request, or null. */
export const getAdmin = cache(async (): Promise<AdminIdentity | null> => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const verified = await verifySessionToken(token);
  if (!verified) {
    return null;
  }
  const session = await prisma.adminSession.findUnique({
    where: { id: verified.sessionId },
    select: { id: true, expiresAt: true, adminUser: { select: { id: true, email: true } } },
  });
  if (!session || session.expiresAt <= new Date()) {
    return null;
  }
  return { id: session.adminUser.id, email: session.adminUser.email, sessionId: session.id };
});

/** First line of every admin page and server action: the admin, or off to sign in. */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) {
    redirect(LOGIN_PATH);
  }
  return admin;
}

/**
 * Where to go after signing in. Only admin paths are accepted, so the `next` parameter
 * cannot be used to send someone to another site.
 */
export function safeAdminPath(value: unknown): string {
  if (typeof value !== "string") {
    return ADMIN_HOME;
  }
  const isAdminPath = /^\/admin(?:[/?][A-Za-z0-9\-._~%/?=&]*)?$/.test(value);
  if (!isAdminPath || value.includes("//") || value.startsWith(LOGIN_PATH)) {
    return ADMIN_HOME;
  }
  return value;
}

/* -------------------------------------------------------------------------- */
/*  Sign-in with rate limiting                                                */
/* -------------------------------------------------------------------------- */

/** Failed attempts allowed per network address, and per email, in the window. */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_IP = 5;
const MAX_FAILURES_PER_EMAIL = 10;
const BCRYPT_COST = 12;

let dummyHash: Promise<string> | null = null;

/** Compared against when the email is unknown, so timing does not reveal which emails exist. */
function getDummyHash(): Promise<string> {
  dummyHash ??= hash(newSessionId(), BCRYPT_COST);
  return dummyHash;
}

/** The client's address as the platform reports it (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Checks the rate limit, then the credentials, records the attempt, and on success starts
 * a session. Failures never say whether the email exists.
 */
export async function attemptLogin(
  emailInput: string,
  password: string,
  ip: string,
): Promise<LoginResult> {
  const email = emailInput.trim().toLowerCase();
  const since = new Date(Date.now() - RATE_WINDOW_MS);

  const [ipFailures, emailFailures] = await Promise.all([
    prisma.adminLoginAttempt.findMany({
      where: { ip, success: false, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.adminLoginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    }),
  ]);
  if (ipFailures.length >= MAX_FAILURES_PER_IP || emailFailures >= MAX_FAILURES_PER_EMAIL) {
    const oldest = ipFailures[0]?.createdAt.getTime() ?? Date.now();
    const minutes = Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - Date.now()) / 60000));
    return {
      ok: false,
      error: `Too many failed sign-in attempts. Wait about ${ipFailures.length >= MAX_FAILURES_PER_IP ? minutes : 15} minutes, then try again.`,
    };
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const matches = await compare(password, user?.passwordHash ?? (await getDummyHash()));
  const success = Boolean(user) && matches;
  await prisma.adminLoginAttempt.create({ data: { ip, email, success } });

  if (!user || !success) {
    return { ok: false, error: "That email and password do not match an admin account." };
  }

  await startSession(user.id);
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  // Housekeeping: expired sessions and attempts older than a day are no longer needed.
  await prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await prisma.adminLoginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  return { ok: true };
}

async function startSession(adminUserId: string): Promise<void> {
  const id = newSessionId();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.adminSession.create({ data: { id, adminUserId, expiresAt } });
  const token = await signSessionToken(id, expiresAt);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: ADMIN_COOKIE_PATH,
    expires: expiresAt,
  });
}

/** Deletes this session's row and its cookie. */
export async function endSession(): Promise<void> {
  const admin = await getAdmin();
  if (admin) {
    await prisma.adminSession.deleteMany({ where: { id: admin.sessionId } });
  }
  (await cookies()).delete({ name: ADMIN_SESSION_COOKIE, path: ADMIN_COOKIE_PATH });
}
