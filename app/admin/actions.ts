"use server";

import { redirect } from "next/navigation";
import { attemptLogin, clientIp, endSession, LOGIN_PATH, safeAdminPath } from "@/lib/admin/auth";
import { text } from "@/lib/admin/forms";
import { isSessionSecretConfigured } from "@/lib/admin/session";

export type LoginState = { error: string | null; email: string };

/** Signs in (rate limited) and goes to the requested admin page, or explains why not. */
export async function login(_previous: LoginState, form: FormData): Promise<LoginState> {
  const email = text(form, "email");
  const password = form.get("password");
  const next = safeAdminPath(text(form, "next"));

  if (!email || typeof password !== "string" || password === "") {
    return { error: "Enter your email and password.", email };
  }
  if (!isSessionSecretConfigured()) {
    return {
      error:
        "Sign-in is not set up on this server yet: ADMIN_SESSION_SECRET is missing. Ask whoever manages the site to add it.",
      email,
    };
  }

  const result = await attemptLogin(email, password, await clientIp());
  if (!result.ok) {
    return { error: result.error, email };
  }
  redirect(next);
}

/** Ends this session (the row and the cookie) and returns to the sign-in page. */
export async function logout(): Promise<void> {
  await endSession();
  redirect(LOGIN_PATH);
}
