"use server";

import { CONTACT_FIELD, validateContact, type ContactErrors } from "@/lib/contact-fields";
import { contactRateLimited, deliverContactMessage } from "@/lib/contact";
import { requestIp } from "@/lib/orders";
import { CONTACT_EMAIL } from "@/lib/site";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  errors?: ContactErrors;
  /** What was typed, so the form keeps it after a failed attempt. */
  values?: Record<string, string>;
  /** Changes on every response, so the form remounts with the echoed values. */
  attempt?: number;
};

/**
 * Sends a contact message. Validates everything on the server whatever the browser did,
 * then applies the honeypot and a per-address limit, saves the message and emails it (or
 * records that it could not). A saved message always shows the sent state: it reaches the
 * client whether or not the email provider is configured yet.
 */
export async function sendContactMessage(
  _previous: ContactState,
  form: FormData,
): Promise<ContactState> {
  const get = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  const values = {
    name: get(CONTACT_FIELD.name).slice(0, 200),
    email: get(CONTACT_FIELD.email).slice(0, 300),
    phone: get(CONTACT_FIELD.phone).slice(0, 50),
    message: get(CONTACT_FIELD.message).slice(0, 6000),
  };
  const attempt = Date.now();

  // Bots fill the hidden field; people never see it. Look successful, keep nothing.
  if (get(CONTACT_FIELD.honeypot) !== "") {
    return { status: "sent", attempt };
  }

  const validation = validateContact(get);
  if (!validation.ok) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      errors: validation.errors,
      values,
      attempt,
    };
  }

  const ip = await requestIp();
  if (await contactRateLimited(ip)) {
    return {
      status: "error",
      message: `Too many messages from this connection. Please try again in an hour, or email ${CONTACT_EMAIL}.`,
      values,
      attempt,
    };
  }

  try {
    await deliverContactMessage(validation.details, ip);
  } catch (error) {
    console.error("[contact] message could not be saved", error);
    return {
      status: "error",
      message: `Your message could not be sent. Please try again, or email ${CONTACT_EMAIL}.`,
      values,
      attempt,
    };
  }
  return { status: "sent", attempt };
}
