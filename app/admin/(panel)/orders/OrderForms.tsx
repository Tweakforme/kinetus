"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { TextArea, TextField } from "@/components/admin/Fields";
import { FormNotice, SubmitButton } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { IDLE_STATE, type FormState } from "@/lib/admin/forms";
import {
  resendOrderNotification,
  saveInternalNotes,
  saveTracking,
  sendShippingNotification,
} from "./actions";

/** Tracking number and carrier, editable after shipping without changing the status. */
export function TrackingForm({
  orderId,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  trackingNumber: string;
  carrier: string;
}) {
  const [state, formAction] = useActionState(saveTracking, IDLE_STATE);
  const echoed = state.status === "error" ? state.values : undefined;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className={styles.detailsForm} noValidate>
      <FormNotice state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <div key={state.savedAt ?? "initial"} className={`${styles.grid} ${styles.grid2}`}>
        <TextField
          label="Tracking number"
          name="trackingNumber"
          mono
          defaultValue={echoed?.trackingNumber ?? trackingNumber}
          error={errors.trackingNumber}
          maxLength={100}
          hint="Optional."
        />
        <TextField
          label="Carrier"
          name="carrier"
          defaultValue={echoed?.carrier ?? carrier}
          error={errors.carrier}
          maxLength={60}
          hint="Optional."
        />
      </div>
      <SubmitButton variant="secondary">Save tracking</SubmitButton>
    </form>
  );
}

/** The client's own notes on the order. Saved on their own; never shown to the customer. */
export function PrivateNotesForm({ orderId, notes }: { orderId: string; notes: string }) {
  const [state, formAction] = useActionState(saveInternalNotes, IDLE_STATE);
  const echoed = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} noValidate>
      <section className={styles.panel} aria-labelledby="notes-heading">
        <h2 id="notes-heading" className={styles.panelTitle}>
          Private notes
        </h2>
        <p className={styles.panelIntro}>
          Only ever shown here. Never shown to the customer and never included in an email. Saving
          notes does not change the order&apos;s status.
        </p>
        <FormNotice state={state} />
        <input type="hidden" name="orderId" value={orderId} />
        <div key={state.savedAt ?? "initial"}>
          <TextArea
            label="Notes on this order (private)"
            name="internalNotes"
            short
            rows={5}
            maxLength={5000}
            defaultValue={echoed?.internalNotes ?? notes}
            error={state.errors?.internalNotes}
          />
        </div>
        <div className={styles.actionRow}>
          <SubmitButton variant="secondary">Save notes</SubmitButton>
        </div>
      </section>
    </form>
  );
}

type EmailDialog = "order" | "shipping" | null;

/** Closes the dialog and moves focus to the result whenever a send finishes. */
function useResult(state: FormState, onResult: () => void) {
  const [seen, setSeen] = useState(state);
  const ref = useRef<HTMLDivElement>(null);
  if (state !== seen) {
    setSeen(state);
    onResult();
  }
  useEffect(() => {
    if (state.status !== "idle") {
      ref.current?.focus();
    }
  }, [state]);
  return ref;
}

/**
 * The two manual emails. Neither is ever sent automatically: each needs a press and a
 * confirmation, and a failure is reported as a failure, never as sent.
 */
export function EmailActions({
  orderId,
  customerEmail,
  shipped,
  trackingNumber,
}: {
  orderId: string;
  customerEmail: string;
  shipped: boolean;
  trackingNumber: string | null;
}) {
  const [orderState, orderAction] = useActionState(resendOrderNotification, IDLE_STATE);
  const [shippingState, shippingAction] = useActionState(sendShippingNotification, IDLE_STATE);
  const [open, setOpen] = useState<EmailDialog>(null);
  // Only the most recent send's result shows, so two results are never confused.
  const [latest, setLatest] = useState<EmailDialog>(null);
  const orderNotice = useResult(orderState, () => {
    setOpen(null);
    setLatest("order");
  });
  const shippingNotice = useResult(shippingState, () => {
    setOpen(null);
    setLatest("shipping");
  });

  return (
    <>
      <div ref={orderNotice} tabIndex={-1}>
        {latest === "order" && <FormNotice state={orderState} />}
      </div>
      <div ref={shippingNotice} tabIndex={-1}>
        {latest === "shipping" && <FormNotice state={shippingState} />}
      </div>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => setOpen("order")}
        >
          Resend order notification
        </button>
        {shipped && (
          <button
            type="button"
            className={`${styles.button} ${styles.secondary}`}
            onClick={() => setOpen("shipping")}
          >
            Send shipping notification
          </button>
        )}
      </div>
      {!shipped && (
        <p className={styles.cardNote}>
          Send shipping notification becomes available once the order is marked shipped.
        </p>
      )}

      <ConfirmDialog
        open={open === "order"}
        onClose={() => setOpen(null)}
        labelledBy="resend-dialog-title"
      >
        <form action={orderAction} className={styles.dialogBody}>
          <h2 id="resend-dialog-title" className={styles.dialogTitle}>
            Send the order emails again?
          </h2>
          <p className={styles.dialogText}>
            Sends the order confirmation to {customerEmail} and the new-order email to the
            store&apos;s order notification address.
          </p>
          <input type="hidden" name="orderId" value={orderId} />
          <div className={styles.dialogActions}>
            <SubmitButton pendingLabel="Sending…">Send order emails</SubmitButton>
            <button
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => setOpen(null)}
              data-initial-focus
            >
              Go back
            </button>
          </div>
        </form>
      </ConfirmDialog>

      <ConfirmDialog
        open={open === "shipping"}
        onClose={() => setOpen(null)}
        labelledBy="shipping-dialog-title"
      >
        <form action={shippingAction} className={styles.dialogBody}>
          <h2 id="shipping-dialog-title" className={styles.dialogTitle}>
            Email the shipping notification?
          </h2>
          <p className={styles.dialogText}>
            Tells {customerEmail} that the order has shipped
            {trackingNumber
              ? `, with tracking number ${trackingNumber}.`
              : ". No tracking number is recorded, so the email does not include one."}
          </p>
          <input type="hidden" name="orderId" value={orderId} />
          <div className={styles.dialogActions}>
            <SubmitButton pendingLabel="Sending…">Send shipping notification</SubmitButton>
            <button
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => setOpen(null)}
              data-initial-focus
            >
              Go back
            </button>
          </div>
        </form>
      </ConfirmDialog>
    </>
  );
}
