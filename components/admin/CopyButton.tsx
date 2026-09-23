"use client";

import { useState } from "react";
import styles from "./admin.module.css";

/**
 * Copies text (the shipping address) to the clipboard. Where the browser refuses, the
 * text is selected on the page instead so it can be copied from the device's own menu.
 */
export function CopyButton({
  text,
  sourceId,
  label,
  copiedMessage,
}: {
  text: string;
  /** The element showing the same text, selected when copying is refused. */
  sourceId: string;
  label: string;
  copiedMessage: string;
}) {
  const [message, setMessage] = useState("");

  const selectSource = () => {
    const source = document.getElementById(sourceId);
    const selection = window.getSelection();
    if (!source || !selection) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(copiedMessage);
    } catch {
      selectSource();
      setMessage(
        "This browser did not allow copying. The text is selected: copy it from your device's menu.",
      );
    }
  };

  return (
    <div className={styles.copyRow}>
      <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={copy}>
        {label}
      </button>
      <p className={styles.hint} aria-live="polite">
        {message}
      </p>
    </div>
  );
}
