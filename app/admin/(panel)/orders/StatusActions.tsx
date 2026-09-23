"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TextField } from "@/components/admin/Fields";
import { FormNotice, SubmitButton } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { IDLE_STATE } from "@/lib/admin/forms";
import type { OrderStatus } from "@/lib/order-status";
import { changeStatus } from "./actions";

/** One change the admin can make, described by the server from current stock levels. */
export type StatusOption = {
  target: OrderStatus;
  /** On the button (or in the correction list). */
  buttonLabel: string;
  /** On the dialog's confirming button. */
  confirmLabel: string;
  title: string;
  /** What the status means, in one sentence. */
  meaning: string;
  /** What happens to stock, sentence by sentence. */
  stock: string[];
  /** Some stock would go below zero. */
  oversold: boolean;
  /** Styled as the main next step. */
  primary: boolean;
  danger: boolean;
};

const DIALOG_TITLE_ID = "status-dialog-title";

/**
 * The order's status buttons, the correction control and the confirmation dialog, which
 * says plainly what the change will do to stock before anything is saved.
 */
export function StatusActions({
  orderId,
  status,
  next,
  corrections,
  shipping,
  finalNote,
}: {
  orderId: string;
  status: OrderStatus;
  next: StatusOption[];
  corrections: StatusOption[];
  /** Pre-filled in the Mark shipped dialog. */
  shipping: { trackingNumber: string; carrier: string };
  /** Shown instead of buttons when there is no usual next step. */
  finalNote: string;
}) {
  const [state, formAction] = useActionState(changeStatus, IDLE_STATE);
  const [chosen, setChosen] = useState<StatusOption | null>(null);
  const [correction, setCorrection] = useState<OrderStatus | null>(null);
  const [seenState, setSeenState] = useState(state);
  const noticeRef = useRef<HTMLDivElement>(null);

  // A finished change (saved or refused) closes the dialog; focus moves to its result.
  if (state !== seenState) {
    setSeenState(state);
    setChosen(null);
  }
  useEffect(() => {
    if (state.status !== "idle") {
      noticeRef.current?.focus();
    }
  }, [state]);

  const selectedCorrection =
    corrections.find((option) => option.target === correction) ?? corrections[0] ?? null;

  return (
    <>
      <div ref={noticeRef} tabIndex={-1}>
        <FormNotice state={state} />
      </div>

      {next.length > 0 ? (
        <div className={styles.actionRow}>
          {next.map((option) => (
            <button
              key={option.target}
              type="button"
              className={`${styles.button} ${
                option.danger ? styles.danger : option.primary ? styles.primary : styles.secondary
              }`}
              onClick={() => setChosen(option)}
            >
              {option.buttonLabel}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.cardNote}>{finalNote}</p>
      )}

      {selectedCorrection && (
        <details className={styles.correct}>
          <summary className={styles.correctSummary}>Correct a mistaken status</summary>
          <p className={styles.hint}>
            Moves the order to any other status. The next step shows what happens to stock before
            anything is saved.
          </p>
          <div className={styles.correctRow}>
            <div className={styles.field}>
              <label htmlFor="correct-status" className={styles.label}>
                Change the status to
              </label>
              <select
                id="correct-status"
                className={styles.select}
                value={selectedCorrection.target}
                onChange={(event) => setCorrection(event.target.value as OrderStatus)}
              >
                {corrections.map((option) => (
                  <option key={option.target} value={option.target}>
                    {option.buttonLabel}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => setChosen(selectedCorrection)}
            >
              Review change
            </button>
          </div>
        </details>
      )}

      <ConfirmDialog
        open={chosen !== null}
        onClose={() => setChosen(null)}
        labelledBy={DIALOG_TITLE_ID}
        initialFocus={
          chosen?.target === "SHIPPED" ? 'input[name="shipping.trackingNumber"]' : undefined
        }
      >
        {chosen && (
          <form action={formAction} className={styles.dialogBody} noValidate>
            <h2 id={DIALOG_TITLE_ID} className={styles.dialogTitle}>
              {chosen.title}
            </h2>
            <p className={styles.dialogText}>{chosen.meaning}</p>
            <div
              className={
                chosen.oversold
                  ? `${styles.dialogStock} ${styles.dialogStockWarn}`
                  : styles.dialogStock
              }
            >
              <p className={styles.dialogStockTitle}>Stock</p>
              {chosen.stock.map((sentence) => (
                <p key={sentence}>{sentence}</p>
              ))}
            </div>
            <input type="hidden" name="orderId" value={orderId} />
            <input type="hidden" name="expectedStatus" value={status} />
            <input type="hidden" name="targetStatus" value={chosen.target} />
            {chosen.target === "SHIPPED" && (
              <div className={`${styles.grid} ${styles.grid2}`}>
                <TextField
                  label="Tracking number"
                  name="shipping.trackingNumber"
                  mono
                  defaultValue={shipping.trackingNumber}
                  maxLength={100}
                  hint="Optional."
                />
                <TextField
                  label="Carrier"
                  name="shipping.carrier"
                  defaultValue={shipping.carrier}
                  maxLength={60}
                  hint="Optional."
                />
              </div>
            )}
            <p className={styles.hint}>No email is sent to the customer.</p>
            <div className={styles.dialogActions}>
              <SubmitButton variant={chosen.danger ? "danger" : "primary"} pendingLabel="Saving…">
                {chosen.confirmLabel}
              </SubmitButton>
              <button
                type="button"
                className={`${styles.button} ${styles.secondary}`}
                onClick={() => setChosen(null)}
                data-initial-focus
              >
                Go back
              </button>
            </div>
          </form>
        )}
      </ConfirmDialog>
    </>
  );
}
