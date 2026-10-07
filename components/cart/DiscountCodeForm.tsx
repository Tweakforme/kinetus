"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useTransition } from "react";
import {
  applyDiscountCode,
  removeDiscountCode,
  type CodeFormState,
} from "@/app/(site)/cart/actions";
import buttons from "@/components/ui/buttons.module.css";
import styles from "./DiscountCodeForm.module.css";

/** The entered code as the server last priced it. */
export type CodeStatus =
  | { kind: "none" }
  | { kind: "applied"; code: string; percentOff: number; savingLabel: string }
  | { kind: "invalid"; code: string; message: string };

const IDLE: CodeFormState = { status: "idle", message: "" };

/**
 * Discount code field with Apply (deck slide 21 "Coupon code"). The code is checked on the
 * server; on success the page re-renders with the discount in the summary. The status line
 * below reports the code in use, or why it does not apply.
 */
export function DiscountCodeForm({ status }: { status: CodeStatus }) {
  const router = useRouter();
  const inputId = useId();
  const messageId = useId();
  const [state, formAction, applying] = useActionState(applyDiscountCode, IDLE);
  const [removing, startRemove] = useTransition();

  useEffect(() => {
    if (state.status === "ok") {
      router.refresh();
    }
  }, [state, router]);

  const onRemove = () => {
    startRemove(async () => {
      await removeDiscountCode();
      router.refresh();
    });
  };

  const showFormError = state.status === "error";
  const current = status.kind === "none" ? null : status;

  return (
    <div className={styles.wrap}>
      <form action={formAction} className={styles.form} noValidate>
        <label htmlFor={inputId} className={styles.label}>
          Discount code
        </label>
        <div className={styles.controls}>
          <input
            id={inputId}
            name="code"
            type="text"
            className={styles.input}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={40}
            placeholder="Enter code"
            aria-invalid={showFormError || undefined}
            aria-describedby={messageId}
            key={current?.code ?? "empty"}
          />
          <button type="submit" className={`${buttons.navy} ${styles.apply}`} disabled={applying}>
            {applying ? "Checking" : "Apply"}
          </button>
        </div>
      </form>

      <div id={messageId} className={styles.messages} aria-live="polite">
        {showFormError && <p className={styles.error}>{state.message}</p>}
        {!showFormError && current && (
          <div className={styles.current}>
            <p className={current.kind === "applied" ? styles.ok : styles.error}>
              {current.kind === "applied" &&
                `${current.code} applied: ${current.percentOff}% off, saving ${current.savingLabel}.`}
              {current.kind === "invalid" && `${current.code}: ${current.message}`}
            </p>
            <button type="button" className={styles.remove} onClick={onRemove} disabled={removing}>
              Remove code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
