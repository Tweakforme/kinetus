import { prisma } from "@/lib/db";
import { NO_API_KEY_REASON } from "@/lib/order-email";

/**
 * Contact form messages in the admin. Read only apart from the handled mark: the client
 * replies from his own inbox. Server only.
 */

/** Messages the client has not marked handled: the admin bar count. */
export function countMessagesNeedingAttention(): Promise<number> {
  return prisma.contactMessage.count({ where: { handledAt: null } });
}

/** Why a message's email did not go, in plain words. */
export function messageSendProblem(sendError: string | null): string {
  if (sendError === null) {
    return "The send was not recorded.";
  }
  return sendError.includes(NO_API_KEY_REASON)
    ? "Email is not set up on this server (RESEND_API_KEY is missing)."
    : `The email service did not accept it: ${sendError.replace(/[.\s]+$/, "")}.`;
}

/** Subject for replying from the client's own email. */
export const REPLY_SUBJECT = "Re: your message to Kinetus BioLabs";
