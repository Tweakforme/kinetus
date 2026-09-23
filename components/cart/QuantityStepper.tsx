"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { MinusIcon, PlusIcon } from "@/components/icons/LineIcons";
import styles from "./QuantityStepper.module.css";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
  /** Visible label above the stepper; omit to label it for screen readers only. */
  label?: string;
  /** Accessible name when there is no visible label, e.g. "Quantity, BPC-157 10 MG". */
  ariaLabel?: string;
  disabled?: boolean;
  size?: "regular" | "compact";
};

/**
 * Minus / number / plus stepper (deck slide 9 "QUANTITY"), 44px targets. The field accepts
 * typing; the value commits on blur or Enter and is clamped to 1..max. Buttons commit at
 * once.
 */
export function QuantityStepper({
  value,
  onChange,
  max,
  label,
  ariaLabel,
  disabled = false,
  size = "regular",
}: QuantityStepperProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(String(value));
  const [shownValue, setShownValue] = useState(value);

  // The value changed from outside (the server re-rendered the cart): show it.
  if (value !== shownValue) {
    setShownValue(value);
    setDraft(String(value));
  }

  const upper = Math.max(1, max);
  const commit = (next: number) => {
    const clamped = Math.min(upper, Math.max(1, Math.round(next)));
    setDraft(String(clamped));
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  const commitDraft = () => {
    const parsed = Number.parseInt(draft, 10);
    commit(Number.isNaN(parsed) ? value : parsed);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      commit(value + 1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      commit(value - 1);
    }
  };

  const name = ariaLabel ?? label ?? "Quantity";
  // "Increase quantity, AHK-cu 50 mg": lowercase the first letter only, never product names.
  const action = name.charAt(0).toLowerCase() + name.slice(1);

  return (
    <div className={styles.wrap}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={size === "compact" ? `${styles.stepper} ${styles.compact}` : styles.stepper}
        role="group"
        aria-label={name}
      >
        <button
          type="button"
          className={styles.button}
          onClick={() => commit(value - 1)}
          disabled={disabled || value <= 1}
          aria-label={`Decrease ${action}`}
        >
          <MinusIcon size={20} />
        </button>
        <input
          id={inputId}
          className={`numeric ${styles.input}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-label={label ? undefined : name}
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, "").slice(0, 2))}
          onBlur={commitDraft}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className={styles.button}
          onClick={() => commit(value + 1)}
          disabled={disabled || value >= upper}
          aria-label={`Increase ${action}`}
        >
          <PlusIcon size={20} />
        </button>
      </div>
    </div>
  );
}
