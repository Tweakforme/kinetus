import { Resend } from "resend";
import type { ContactDetails } from "@/lib/contact-fields";
import { prisma } from "@/lib/db";
import { renderEmail } from "@/lib/email-template";
import { DEFAULT_FROM } from "@/lib/order-email";
import { CONTACT_EMAIL, RESEARCH_USE_COPY, SITE_NAME } from "@/lib/site";

/**
 * Contact form delivery. Every submission is saved as a ContactMessage first, then emailed
 * to the client through Resend. Without RESEND_API_KEY nothing is sent: the payload is
 * logged and the row records why, so the client can read it later and nothing is lost.
 */

const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGES_PER_IP = 5;

/** True when this address has sent the maximum number of messages in the last hour. */
export async function contactRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const recent = await prisma.contactMessage.count({ where: { ip, createdAt: { gte: since } } });
  return recent >= MAX_MESSAGES_PER_IP;
}

/** The message in the site's email layout, with its plain-text version. */
function messageBody(details: ContactDetails, id: string): { html: string; text: string } {
  return renderEmail({
    title: `New message from the ${SITE_NAME} contact form`,
    sections: [
      {
        rows: [
          ["Name", details.name],
          ["Email", details.email],
          ["Phone", details.phone ?? "Not provided"],
        ],
      },
      { heading: "Message", lines: [details.message] },
      { lines: [`Reference: ${id}`] },
    ],
    footer: [RESEARCH_USE_COPY],
  });
}

/**
 * Saves the message, then emails it (or logs it without a key) and records the outcome.
 * Throws only if the message could not be saved; a send failure is recorded, not raised.
 * Returns whether the email was accepted, so the form never says "sent" when it was not.
 */
export async function deliverContactMessage(details: ContactDetails, ip: string): Promise<boolean> {
  const row = await prisma.contactMessage.create({
    data: { ...details, ip },
    select: { id: true },
  });

  const body = messageBody(details, row.id);
  const email = {
    // TODO: confirm the mailbox for contact messages (the published address for now).
    to: CONTACT_EMAIL,
    subject: `Contact form: ${details.name}`,
    text: body.text,
    html: body.html,
    replyTo: details.email,
  };

  const apiKey = process.env.RESEND_API_KEY?.trim();
  let sendError: string | null = null;
  if (!apiKey) {
    console.info(
      `[contact] RESEND_API_KEY is not set; not sent. Saved as ${row.id}:\n` +
        JSON.stringify({ to: email.to, subject: email.subject, text: email.text }, null, 2),
    );
    sendError = "RESEND_API_KEY is not set; the message was saved and logged, not sent.";
  } else {
    try {
      const from = process.env.ORDER_EMAIL_FROM?.trim() || DEFAULT_FROM;
      const { error } = await new Resend(apiKey).emails.send({ from, ...email });
      if (error) {
        sendError = error.message.slice(0, 500);
      }
    } catch (error) {
      sendError = (error instanceof Error ? error.message : String(error)).slice(0, 500);
    }
  }

  try {
    await prisma.contactMessage.update({
      where: { id: row.id },
      data: sendError ? { sendError } : { sentAt: new Date(), sendError: null },
    });
  } catch (error) {
    console.error(`[contact] ${row.id}: could not record the send outcome`, error);
  }
  return sendError === null;
}
