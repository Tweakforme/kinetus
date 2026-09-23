/**
 * Contact form fields and their validation, shared by the browser form and the server
 * action (which always validates again). Pure, so node:test runs it
 * (lib/contact-fields.test.ts).
 */

export const CONTACT_FIELD = {
  name: "name",
  email: "email",
  phone: "phone",
  message: "message",
  /** Honeypot: hidden from people, left empty by them, often filled by bots. */
  honeypot: "website",
} as const;

export type ContactDetails = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
};

export type ContactErrors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

export type ContactValidation =
  { ok: true; details: ContactDetails } | { ok: false; errors: ContactErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits with the usual separators; the digit count (7 to 15) is checked separately. */
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

export const CONTACT_LIMITS = { name: 120, email: 254, phone: 30, message: 5000 } as const;

export function validateContact(get: (name: string) => string): ContactValidation {
  const errors: ContactErrors = {};

  const name = get(CONTACT_FIELD.name).trim().replace(/\s+/g, " ");
  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > CONTACT_LIMITS.name) {
    errors.name = `Keep your name to ${CONTACT_LIMITS.name} characters or fewer.`;
  }

  const email = get(CONTACT_FIELD.email).trim().toLowerCase();
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter an email address like name@example.com.";
  }

  const phone = get(CONTACT_FIELD.phone).trim();
  const digits = phone.replace(/\D/g, "").length;
  if (
    phone &&
    (phone.length > CONTACT_LIMITS.phone || !PHONE_PATTERN.test(phone) || digits < 7 || digits > 15)
  ) {
    errors.phone = "Enter a phone number, or leave it empty.";
  }

  const message = get(CONTACT_FIELD.message).trim();
  if (!message) {
    errors.message = "Enter a message.";
  } else if (message.length > CONTACT_LIMITS.message) {
    errors.message = `Keep the message to ${CONTACT_LIMITS.message} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, details: { name, email, phone: phone || null, message } };
}
