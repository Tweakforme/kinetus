"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { sendContactMessage, type ContactState } from "@/app/(site)/(content)/contact/actions";
import buttons from "@/components/ui/buttons.module.css";
import { CONTACT_FIELD, validateContact, type ContactErrors } from "@/lib/contact-fields";
import { CONTACT_EMAIL } from "@/lib/site";
import styles from "./ContactForm.module.css";

const IDLE: ContactState = { status: "idle" };

type FieldName = keyof ContactErrors;

/**
 * Enquiry form (deck slide 23, the client's contact mockup): name, phone (optional),
 * email, message, Send Message. Submitted to a server action that validates, saves and
 * emails the message; the browser check here is only for quick feedback. The mailbox
 * stays visible beneath the button as a fallback.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, IDLE);
  // Seeded from the server response too, so errors render without JavaScript.
  const [errors, setErrors] = useState<ContactErrors>(state.errors ?? {});
  const [seenAttempt, setSeenAttempt] = useState(state.attempt);
  const statusRef = useRef<HTMLDivElement>(null);
  const values = state.status === "error" ? (state.values ?? {}) : {};

  if (state.attempt !== seenAttempt) {
    setSeenAttempt(state.attempt);
    setErrors(state.errors ?? {});
  }

  useEffect(() => {
    if (state.status !== "idle") {
      statusRef.current?.focus();
    }
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const result = validateContact((name) => {
      const value = data.get(name);
      return typeof value === "string" ? value : "";
    });
    if (!result.ok) {
      event.preventDefault();
      setErrors(result.errors);
      const first = Object.keys(result.errors)[0];
      if (first) {
        document.getElementById(`contact-${first}`)?.focus();
      }
      return;
    }
    setErrors({});
  };

  const clearError = (name: FieldName) => {
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
    }
  };

  const describedBy = (name: FieldName) => (errors[name] ? `contact-${name}-error` : undefined);
  const errorText = (name: FieldName) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} className={styles.error}>
        {errors[name]}
      </p>
    ) : null;

  if (state.status === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} className={styles.sent} role="status">
        <p className={styles.sentTitle}>Thank you. Your message has been sent.</p>
        <p className={styles.note}>We typically respond within 1 business day.</p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className={styles.form}>
      <div
        ref={statusRef}
        tabIndex={-1}
        role="alert"
        className={state.status === "error" && state.message ? styles.alert : styles.alertEmpty}
      >
        {state.status === "error" ? state.message : null}
      </div>

      <div key={state.attempt ?? "initial"} className={styles.fields}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="contact-name" className={styles.label}>
              Name
            </label>
            <input
              id="contact-name"
              name={CONTACT_FIELD.name}
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              placeholder="Enter your full name"
              defaultValue={values.name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name")}
              className={styles.input}
              onInput={() => clearError("name")}
            />
            {errorText("name")}
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-phone" className={styles.label}>
              Phone <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="contact-phone"
              name={CONTACT_FIELD.phone}
              type="tel"
              autoComplete="tel"
              maxLength={30}
              placeholder="Phone number"
              defaultValue={values.phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={describedBy("phone")}
              className={styles.input}
              onInput={() => clearError("phone")}
            />
            {errorText("phone")}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email" className={styles.label}>
            Email
          </label>
          <input
            id="contact-email"
            name={CONTACT_FIELD.email}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="example@domain.com"
            defaultValue={values.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className={styles.input}
            onInput={() => clearError("email")}
          />
          {errorText("email")}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-message" className={styles.label}>
            Message
          </label>
          <textarea
            id="contact-message"
            name={CONTACT_FIELD.message}
            required
            rows={6}
            maxLength={5000}
            placeholder="Tell us how we can help you..."
            defaultValue={values.message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message")}
            className={`${styles.input} ${styles.textarea}`}
            onInput={() => clearError("message")}
          />
          {errorText("message")}
        </div>

        {/* Honeypot: off-screen and out of the tab order; people leave it empty. */}
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name={CONTACT_FIELD.honeypot}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className={buttons.solid}
          aria-disabled={pending || undefined}
          onClick={(event) => {
            if (pending) {
              event.preventDefault();
            }
          }}
        >
          {pending ? "Sending" : "Send message"}
        </button>
      </div>

      <p className={styles.note}>We typically respond within 1 business day.</p>
      <p className={styles.note}>
        You can also write to us directly at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.noteLink}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
