"use client";

import { type FormEvent, useState } from "react";
import buttons from "@/components/ui/buttons.module.css";
import { CONTACT_EMAIL } from "@/lib/site";
import styles from "./ContactForm.module.css";

const DEFAULT_SUBJECT = "Enquiry";

/** The form's target without JavaScript: the mailbox with the subject only. */
const FORM_ACTION = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DEFAULT_SUBJECT)}`;

type Fields = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

function readField(data: FormData, key: keyof Fields): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** The mailto URL that carries the enquiry: subject from the name, body from the fields. */
function buildMailto(fields: Fields): string {
  const subject = fields.name ? `${DEFAULT_SUBJECT} from ${fields.name}` : DEFAULT_SUBJECT;
  const body = [
    `Name: ${fields.name}`,
    `Phone: ${fields.phone || "Not provided"}`,
    `Email: ${fields.email}`,
    "",
    "Message:",
    fields.message,
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Enquiry form (deck slide 23). There is no backend: on submit the fields are composed
 * into a mailto URL and handed to the visitor's email app. Without JavaScript the form
 * still targets the mailbox, and the address is printed beneath the button.
 */
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    window.location.href = buildMailto({
      name: readField(data, "name"),
      phone: readField(data, "phone"),
      email: readField(data, "email"),
      message: readField(data, "message"),
    });
    setOpened(true);
  }

  return (
    <form className={styles.form} action={FORM_ACTION} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="contact-name" className={styles.label}>
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Enter your full name"
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-phone" className={styles.label}>
            Phone number <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone number"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="example@domain.com"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message" className={styles.label}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Tell us how we can help you..."
          className={`${styles.input} ${styles.textarea}`}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={buttons.solid}>
          Send inquiry
        </button>
      </div>

      <p className={styles.note}>
        Sending opens your email app with the message prefilled. You can also write to us directly.{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.noteLink}>
          {CONTACT_EMAIL}
        </a>
      </p>

      <p className={styles.status} role="status" aria-live="polite">
        {opened
          ? "Your email app should now be open with the message prefilled. If it did not open, write to the address above."
          : ""}
      </p>
    </form>
  );
}
