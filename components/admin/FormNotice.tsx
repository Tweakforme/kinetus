"use client";

import { useFormStatus } from "react-dom";
import { fieldId, type FormState } from "@/lib/admin/forms";
import styles from "./admin.module.css";

/**
 * The result of the last save at the top of a form: a confirmation, or the error message
 * with every problem listed as a link to its field.
 */
export function FormNotice({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }
  if (state.status === "success") {
    return (
      <div role="status" className={`${styles.notice} ${styles.noticeSuccess}`}>
        <p>{state.message}</p>
      </div>
    );
  }
  const errors = Object.entries(state.errors ?? {});
  return (
    <div role="alert" className={`${styles.notice} ${styles.noticeError}`}>
      <p className={styles.noticeTitle}>{state.message}</p>
      {errors.length > 0 && (
        <ul className={styles.noticeList}>
          {errors.map(([name, message]) => (
            <li key={name}>
              <a href={`#${fieldId(name)}`}>{message}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type SubmitButtonProps = {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
};

/** Disabled with a working label while its form is being saved. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${styles.button} ${styles[variant]}`} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * The sticky bar at the bottom of a long form: what the last save did, and the button.
 * Stays in view while scrolling, so a price can be changed and saved on a phone without
 * hunting for the button.
 */
export function SaveBar({
  state,
  label,
  idleText,
}: {
  state: FormState;
  label: string;
  idleText: string;
}) {
  const errorCount = Object.keys(state.errors ?? {}).length;
  const text =
    state.status === "error"
      ? errorCount > 0
        ? `Not saved: ${errorCount} ${errorCount === 1 ? "field needs" : "fields need"} attention (listed at the top of this form).`
        : (state.message ?? "Not saved.")
      : state.status === "success"
        ? (state.message ?? "Saved.")
        : idleText;
  return (
    <div className={styles.saveBar}>
      <p className={styles.saveBarText} aria-live="polite">
        {text}
      </p>
      <SubmitButton>{label}</SubmitButton>
    </div>
  );
}
