"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { errorState, optionalText, successState, text, type FormState } from "@/lib/admin/forms";
import {
  changeOrderStatus,
  notifyShipped,
  OrderChangeError,
  type StatusChangeResult,
} from "@/lib/admin/orders";
import { expireProductPages, refreshAdmin } from "@/lib/admin/revalidate";
import { prisma } from "@/lib/db";
import { NO_API_KEY_REASON } from "@/lib/order-email";
import { describeStock, isOrderStatus, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { notifyOrder } from "@/lib/orders";

const LIMITS = { trackingNumber: 100, carrier: 60, internalNotes: 5000 };

type Tracking = { trackingNumber: string | null; carrier: string | null };

/** Tracking number and carrier, both optional. `prefix` names the fields in a form. */
function parseTracking(
  form: FormData,
  prefix = "",
): { ok: true; value: Tracking } | { ok: false; errors: Record<string, string> } {
  const trackingNumber = optionalText(form, `${prefix}trackingNumber`);
  const carrier = optionalText(form, `${prefix}carrier`);
  const errors: Record<string, string> = {};
  if (trackingNumber !== null && trackingNumber.length > LIMITS.trackingNumber) {
    errors[`${prefix}trackingNumber`] =
      `Keep the tracking number to ${LIMITS.trackingNumber} characters or fewer.`;
  }
  if (carrier !== null && carrier.length > LIMITS.carrier) {
    errors[`${prefix}carrier`] = `Keep the carrier to ${LIMITS.carrier} characters or fewer.`;
  }
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { trackingNumber, carrier } };
}

/** A failed send: which email, why, and what to do instead. Never styled as a success. */
function sendFailure(
  what: "The order emails were" | "The shipping notification was",
  reason: string,
  order: { customerEmail: string; customerPhone: string },
): FormState {
  const why = reason.includes(NO_API_KEY_REASON)
    ? "Email is not set up on this server (RESEND_API_KEY is missing), so the message was written to the server log instead."
    : `The email service did not accept it: ${reason.replace(/[.\s]+$/, "")}.`;
  return {
    status: "error",
    message: `${what} not sent.`,
    detail: `${why} Contact the customer directly at ${order.customerEmail} or ${order.customerPhone}.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Status                                                                    */
/* -------------------------------------------------------------------------- */

function statusMessage(result: StatusChangeResult): string {
  const parts = [
    `${result.reference} is now ${ORDER_STATUS_LABEL[result.to]}.`,
    ...describeStock(result.stock, "did"),
  ];
  if (result.to === "SHIPPED") {
    parts.push("No email was sent. To tell the customer, use Send shipping notification.");
  }
  return parts.join(" ");
}

/**
 * Moves an order to the chosen status after the admin confirmed it. Refused, with nothing
 * changed, if the order is no longer in the status the page showed.
 */
export async function changeStatus(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const orderId = text(form, "orderId");
  const expected = text(form, "expectedStatus");
  const target = text(form, "targetStatus");
  if (!isOrderStatus(expected) || !isOrderStatus(target)) {
    return { status: "error", message: "Nothing was changed: choose a status from the list." };
  }

  let shipping: Tracking | undefined;
  if (target === "SHIPPED") {
    const parsed = parseTracking(form, "shipping.");
    if (!parsed.ok) {
      return {
        status: "error",
        message: `Nothing was changed. ${Object.values(parsed.errors).join(" ")}`,
      };
    }
    shipping = parsed.value;
  }

  let result: StatusChangeResult;
  try {
    result = await changeOrderStatus({ orderId, expected, target, shipping });
  } catch (error) {
    if (error instanceof OrderChangeError) {
      refreshAdmin();
      return { status: "error", message: "Nothing was changed.", detail: error.message };
    }
    throw error;
  }

  // Product pages show availability, so any stock change refreshes them too.
  if (result.changedSlugs.length > 0) {
    expireProductPages(...result.changedSlugs);
  } else {
    refreshAdmin();
  }
  return successState(statusMessage(result));
}

/** Tracking number and carrier on their own, for adding or correcting them after shipping. */
export async function saveTracking(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseTracking(form);
  if (!parsed.ok) {
    return errorState(parsed.errors, form, "The tracking details were not saved.");
  }
  const { count } = await prisma.orderRequest.updateMany({
    where: { id: text(form, "orderId") },
    data: parsed.value,
  });
  if (count === 0) {
    return { status: "error", message: "Nothing was saved: this order no longer exists." };
  }
  refreshAdmin();
  return successState("Tracking details saved. No email was sent.");
}

/* -------------------------------------------------------------------------- */
/*  Private notes                                                             */
/* -------------------------------------------------------------------------- */

/** Saves the private notes only; the status, stock and everything else stay as they are. */
export async function saveInternalNotes(_previous: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  // Browsers submit textarea line breaks as CRLF but count them as one character, so they
  // are normalised before the length check.
  const notes = text(form, "internalNotes").replace(/\r\n?/g, "\n");
  if (notes.length > LIMITS.internalNotes) {
    return errorState(
      { internalNotes: `Keep the notes to ${LIMITS.internalNotes} characters or fewer.` },
      form,
      "The notes were not saved.",
    );
  }
  const { count } = await prisma.orderRequest.updateMany({
    where: { id: text(form, "orderId") },
    data: { internalNotes: notes === "" ? null : notes },
  });
  if (count === 0) {
    return { status: "error", message: "Nothing was saved: this order no longer exists." };
  }
  refreshAdmin();
  return successState(notes === "" ? "Private notes cleared." : "Private notes saved.");
}

/* -------------------------------------------------------------------------- */
/*  Emails: sent only when the admin presses the button                      */
/* -------------------------------------------------------------------------- */

function loadOrderForEmail(orderId: string) {
  return prisma.orderRequest.findUnique({
    where: { id: orderId },
    include: { items: { orderBy: { id: "asc" } } },
  });
}

/** Sends both order emails again (to the customer and to the store) and records the result. */
export async function resendOrderNotification(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  const order = await loadOrderForEmail(text(form, "orderId"));
  if (!order) {
    return { status: "error", message: "Nothing was sent: this order no longer exists." };
  }
  const outcome = await notifyOrder(order);
  refreshAdmin();
  if (outcome.sent) {
    return successState(
      `The order emails were sent: to ${order.customerEmail}, and to the store's order notification address.`,
    );
  }
  return sendFailure("The order emails were", outcome.reason, order);
}

/** Emails the customer that the order has shipped, with the tracking details recorded. */
export async function sendShippingNotification(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  await requireAdmin();
  const order = await loadOrderForEmail(text(form, "orderId"));
  if (!order) {
    return { status: "error", message: "Nothing was sent: this order no longer exists." };
  }
  if (order.status !== "SHIPPED") {
    refreshAdmin();
    return {
      status: "error",
      message: `Nothing was sent: the order is ${ORDER_STATUS_LABEL[order.status]}, not Shipped.`,
    };
  }
  const outcome = await notifyShipped(order);
  refreshAdmin();
  if (outcome.sent) {
    return successState(
      order.trackingNumber
        ? `The shipping notification was sent to ${order.customerEmail}, with tracking number ${order.trackingNumber}.`
        : `The shipping notification was sent to ${order.customerEmail}, without a tracking number (none is recorded).`,
    );
  }
  return sendFailure("The shipping notification was", outcome.reason, order);
}
