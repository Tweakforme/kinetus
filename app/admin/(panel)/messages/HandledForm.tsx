"use client";

import { useActionState, useEffect } from "react";
import { announceCountsChanged } from "@/components/admin/AdminNav";
import { FormNotice, SubmitButton } from "@/components/admin/FormNotice";
import styles from "@/components/admin/admin.module.css";
import { IDLE_STATE } from "@/lib/admin/forms";
import { setMessageHandled } from "./actions";

/** The handled mark for one message: a single button that switches it either way. */
export function HandledForm({ messageId, handled }: { messageId: string; handled: boolean }) {
  const [state, formAction] = useActionState(setMessageHandled, IDLE_STATE);

  // The waiting count in the admin bar changes with the mark (or with a message removed).
  useEffect(() => {
    if (state.status !== "idle") {
      announceCountsChanged();
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.detailsForm}>
      <FormNotice state={state} />
      <input type="hidden" name="messageId" value={messageId} />
      <input type="hidden" name="handled" value={handled ? "0" : "1"} />
      <div className={styles.actionRow}>
        <SubmitButton variant={handled ? "secondary" : "primary"} pendingLabel="Saving…">
          {handled ? "Mark as not handled" : "Mark as handled"}
        </SubmitButton>
      </div>
    </form>
  );
}
