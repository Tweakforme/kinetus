"use client";

import { useState, type ReactNode } from "react";
import { fieldId } from "@/lib/admin/forms";
import styles from "./admin.module.css";

/**
 * Admin form fields. Each renders a visible label, the control, then (when the last save
 * failed) the error and the hint, both linked with aria-describedby. Hints sit under the
 * control so side-by-side controls line up whatever the length of their hints. Controls
 * are uncontrolled: values come from `defaultValue`, and failed saves echo back what was
 * typed.
 */

type FieldBase = {
  label: string;
  name: string;
  hint?: ReactNode;
  error?: string;
  /** Adds "(required)" to the label; the server enforces it. */
  required?: boolean;
  className?: string;
};

function describedBy(id: string, hint: unknown, error: unknown): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className={styles.label}>
      {label}
      {required && <span className={styles.labelNote}> (required)</span>}
    </label>
  );
}

function Hint({ id, hint }: { id: string; hint?: ReactNode }) {
  return hint ? (
    <p id={`${id}-hint`} className={styles.hint}>
      {hint}
    </p>
  ) : null;
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-error`} className={styles.error}>
      {error}
    </p>
  ) : null;
}

type Guide = { max: number; unit?: string };

/** Live character count against a recommended maximum (guidance, not a limit). */
function CharGuide({ length, guide }: { length: number; guide: Guide }) {
  const over = length > guide.max;
  return (
    <p className={over ? `${styles.count} ${styles.countOver}` : styles.count} aria-live="polite">
      {length} of {guide.max} characters recommended{over ? ", over the recommendation" : ""}
    </p>
  );
}

type TextFieldProps = FieldBase & {
  defaultValue?: string;
  type?: "text" | "email" | "password" | "url" | "datetime-local";
  inputMode?: "text" | "decimal" | "numeric" | "url" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  mono?: boolean;
  /** Text shown before the input, e.g. "$". */
  prefix?: string;
  guide?: Guide;
  readOnly?: boolean;
  onValueInput?: (value: string) => void;
  inputRef?: (element: HTMLInputElement | null) => void;
};

export function TextField({
  label,
  name,
  hint,
  error,
  required,
  className,
  defaultValue = "",
  type = "text",
  inputMode,
  autoComplete = "off",
  placeholder,
  maxLength,
  mono,
  prefix,
  guide,
  readOnly,
  onValueInput,
  inputRef,
}: TextFieldProps) {
  const id = fieldId(name);
  const [length, setLength] = useState(defaultValue.length);
  const classes = [styles.input, mono ? styles.mono : null, error ? styles.invalid : null]
    .filter(Boolean)
    .join(" ");

  const input = (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type={type}
      className={classes}
      defaultValue={defaultValue}
      inputMode={inputMode}
      autoComplete={autoComplete}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, hint, error)}
      onInput={(event) => {
        setLength(event.currentTarget.value.length);
        onValueInput?.(event.currentTarget.value);
      }}
    />
  );

  return (
    <div className={className ? `${styles.field} ${className}` : styles.field}>
      <Label id={id} label={label} required={required} />
      {prefix ? (
        <div className={styles.prefixed}>
          <span className={styles.prefix} aria-hidden="true">
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      {guide && <CharGuide length={length} guide={guide} />}
      <FieldError id={id} error={error} />
      <Hint id={id} hint={hint} />
    </div>
  );
}

type TextAreaProps = FieldBase & {
  defaultValue?: string;
  rows?: number;
  short?: boolean;
  guide?: Guide;
  maxLength?: number;
  /** Extra content between the hint and the textarea (the content rule). */
  before?: ReactNode;
};

export function TextArea({
  label,
  name,
  hint,
  error,
  required,
  className,
  defaultValue = "",
  rows,
  short,
  guide,
  maxLength,
  before,
}: TextAreaProps) {
  const id = fieldId(name);
  const [length, setLength] = useState(defaultValue.length);
  const classes = [
    styles.textarea,
    short ? styles.textareaShort : null,
    error ? styles.invalid : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className ? `${styles.field} ${className}` : styles.field}>
      <Label id={id} label={label} required={required} />
      {before}
      <textarea
        id={id}
        name={name}
        rows={rows}
        className={classes}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onInput={(event) => setLength(event.currentTarget.value.length)}
      />
      {guide && <CharGuide length={length} guide={guide} />}
      <FieldError id={id} error={error} />
      <Hint id={id} hint={hint} />
    </div>
  );
}

export type Option = { value: string; label: string };

type SelectFieldProps = FieldBase & {
  options: Option[];
  defaultValue?: string;
};

export function SelectField({
  label,
  name,
  hint,
  error,
  required,
  className,
  options,
  defaultValue,
}: SelectFieldProps) {
  const id = fieldId(name);
  return (
    <div className={className ? `${styles.field} ${className}` : styles.field}>
      <Label id={id} label={label} required={required} />
      {/* Keyed on its default: React applies a select's defaultValue only when it mounts,
          so after a failed save the form reset would otherwise restore the original option
          instead of the one the user chose. */}
      <select
        key={defaultValue}
        id={id}
        name={name}
        className={error ? `${styles.select} ${styles.invalid}` : styles.select}
        defaultValue={defaultValue}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={id} error={error} />
      <Hint id={id} hint={hint} />
    </div>
  );
}

type CheckboxFieldProps = {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: ReactNode;
  error?: string;
  value?: string;
  className?: string;
};

/** A checkbox whose whole label row is the target. */
export function CheckboxField({
  label,
  name,
  defaultChecked,
  hint,
  error,
  value = "on",
  className,
}: CheckboxFieldProps) {
  const id = fieldId(value === "on" ? name : `${name}-${value}`);
  return (
    <div className={className}>
      <label className={styles.check} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          className={styles.checkInput}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
        />
        <span className={styles.checkText}>
          <span className={styles.checkTitle}>{label}</span>
          {hint && (
            <span id={`${id}-hint`} className={styles.hint}>
              {hint}
            </span>
          )}
        </span>
      </label>
      <FieldError id={id} error={error} />
    </div>
  );
}
