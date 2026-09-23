"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./admin.module.css";

/**
 * A modal confirmation built on the native dialog element: focus stays inside, Escape
 * closes it and the page behind cannot be used until it does. Open while `open` is true;
 * `onClose` runs however it was closed. On opening, focus goes to the element matching
 * `initialFocus` (by default the one marked data-initial-focus, the safe choice), so a
 * stray Enter never confirms anything.
 */
export function ConfirmDialog({
  open,
  onClose,
  labelledBy,
  initialFocus = "[data-initial-focus]",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  initialFocus?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>(initialFocus)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby={labelledBy} onClose={onClose}>
      {open ? children : null}
    </dialog>
  );
}
