"use client";

import { useActionState } from "react";
import { TextField } from "@/components/admin/Fields";
import { SubmitButton } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { login, type LoginState } from "../actions";

export function LoginForm({ next, configured }: { next: string; configured: boolean }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {
    error: configured
      ? null
      : "Sign-in is not set up on this server yet: ADMIN_SESSION_SECRET is missing.",
    email: "",
  });

  return (
    <form action={formAction} className={styles.loginForm} noValidate>
      {state.error && (
        <div role="alert" className={`${styles.notice} ${styles.noticeError}`}>
          <p>{state.error}</p>
        </div>
      )}
      <input type="hidden" name="next" value={next} />
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="username"
        defaultValue={state.email}
      />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" />
      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
