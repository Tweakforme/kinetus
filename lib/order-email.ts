import type { OrderRequest, OrderRequestItem } from "@prisma/client";
import { Resend } from "resend";
import { provinceName } from "@/lib/checkout-fields";
import { renderEmail, type EmailItemRow, type EmailSection } from "@/lib/email-template";
import { formatCad } from "@/lib/pricing";
import { canonicalUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/**
 * Order notification emails, sent through Resend: one to the client with everything
 * needed to work the order, one to the customer with the reference and what happens next,
 * and (only when the client presses the admin button) the customer's shipping
 * notification. Plain and neutral. Without RESEND_API_KEY nothing is sent: the payloads are
 * logged to the server console and the order records why, so the client can follow up by
 * hand.
 */

// TODO: confirm the sending address once the client's domain is verified in Resend.
// Shared with the contact form (lib/contact.ts).
export const DEFAULT_FROM = `${SITE_NAME} <orders@kinetusbiolabs.ca>`;
// TODO: confirm where order notifications go when StoreSetting.orderNotifyEmail is empty.
const FALLBACK_NOTIFY_EMAIL = "info@kinetusbiolabs.ca";

const FOOTER =
  "All products are sold for laboratory research use only. Not for human or animal consumption.";

export type OrderForEmail = OrderRequest & { items: OrderRequestItem[] };

export type EmailSettings = {
  orderNotifyEmail: string | null;
  etransferEmail: string | null;
  etransferInstructions: string | null;
  /** Payment Instructions fields (Admin > Settings); each is left out while empty. */
  payeeName?: string | null;
  securityQuestion?: string | null;
  securityAnswer?: string | null;
  holdPeriodText?: string | null;
};

type Message = { to: string; subject: string; text: string; html: string; replyTo?: string };

export type SendOutcome = { sent: true } | { sent: false; reason: string };

/** Summary lines in the order the site shows them; zero discounts and tax-off are omitted. */
export function summaryLines(order: OrderRequest): Array<[string, string]> {
  const lines: Array<[string, string]> = [["Subtotal", formatCad(order.subtotalCents)]];
  if (order.volumeDiscountCents > 0) {
    lines.push(["Volume discount", `-${formatCad(order.volumeDiscountCents)}`]);
  }
  if (order.codeDiscountCents > 0) {
    lines.push([
      `Discount code${order.discountCodeUsed ? ` (${order.discountCodeUsed})` : ""}`,
      `-${formatCad(order.codeDiscountCents)}`,
    ]);
  }
  lines.push(["Shipping", order.shippingCents > 0 ? formatCad(order.shippingCents) : "Free"]);
  if (order.taxCents > 0 || order.taxLabel) {
    lines.push([order.taxLabel ?? "Tax", formatCad(order.taxCents)]);
  }
  lines.push(["Total (CAD)", formatCad(order.totalCents)]);
  return lines;
}

function itemLines(order: OrderForEmail): string[] {
  return order.items.map(
    (item) =>
      `${item.quantity} x ${item.productNameSnapshot} ${item.variantLabelSnapshot}` +
      `${item.skuSnapshot ? ` (${item.skuSnapshot})` : ""} at ${formatCad(item.unitPriceSnapshot)}` +
      ` = ${formatCad(item.lineTotalCents)}`,
  );
}

/** The items as table rows for the HTML email: product, strength, quantity, line total. */
function itemRows(order: OrderForEmail): EmailItemRow[] {
  return order.items.map((item) => ({
    product: item.productNameSnapshot,
    strength: item.variantLabelSnapshot,
    quantity: item.quantity,
    price: formatCad(item.lineTotalCents),
  }));
}

/** Items (table in HTML, the item lines in text) with the order's totals beneath. */
function itemsSection(order: OrderForEmail, heading: string) {
  const totals = summaryLines(order);
  return {
    heading,
    items: { rows: itemRows(order), totals },
    lines: [...itemLines(order), ...totals.map(([label, value]) => `${label}: ${value}`)],
  };
}

function addressLines(order: OrderRequest): string[] {
  return [
    order.customerName,
    order.shippingLine1,
    ...(order.shippingLine2 ? [order.shippingLine2] : []),
    `${order.shippingCity}, ${provinceName(order.shippingProvince)} ${order.shippingPostalCode}`,
    "Canada",
  ];
}

export function clientMessage(order: OrderForEmail, settings: EmailSettings): Message {
  const { html, text } = renderEmail({
    title: "New order",
    reference: order.referenceNumber,
    sections: [
      { lines: [`New order ${order.referenceNumber}`, `Placed ${order.createdAt.toISOString()}`] },
      {
        heading: "Customer",
        lines: [order.customerName, order.customerEmail, order.customerPhone],
      },
      { heading: "Ship to", lines: addressLines(order) },
      itemsSection(order, "Items"),
      { heading: "Order note", lines: [order.note ?? "None"] },
      {
        heading: "Confirmations",
        lines: [
          `18 or older: ${order.ageConfirmed ? "confirmed" : "not confirmed"}`,
          `Laboratory research use only: ${order.researchUseAcknowledged ? "confirmed" : "not confirmed"}`,
        ],
      },
      {
        heading: "Admin",
        lines: [canonicalUrl(`/admin/orders/${order.referenceNumber}`)],
      },
    ],
    footer: [FOOTER],
  });
  return {
    to: settings.orderNotifyEmail?.trim() || FALLBACK_NOTIFY_EMAIL,
    subject: `New order ${order.referenceNumber} (${formatCad(order.totalCents)})`,
    text,
    html,
    replyTo: order.customerEmail,
  };
}

export function customerMessage(order: OrderForEmail, settings: EmailSettings): Message {
  // The bordered Payment Instructions box: StoreSetting values only, each hidden while
  // empty, and the box itself only when at least one is set.
  const paymentRows: Array<[string, string | null | undefined]> = [
    ["Interac e-Transfer email", settings.etransferEmail],
    ["Payee name", settings.payeeName],
    ["Security question", settings.securityQuestion],
    ["Security answer", settings.securityAnswer],
  ];
  const paymentText = [settings.holdPeriodText, settings.etransferInstructions].filter(
    (line): line is string => Boolean(line?.trim()),
  );
  const hasPayment = paymentRows.some(([, value]) => value?.trim()) || paymentText.length > 0;

  const { html, text } = renderEmail({
    title: "Thank you for your order",
    reference: order.referenceNumber,
    sections: [
      {
        lines: [
          `Thank you. We have received order ${order.referenceNumber}.`,
          "This email acknowledges that the order was received. It does not confirm the order, which is not confirmed until payment has been arranged.",
        ],
      },
      itemsSection(order, "What you ordered"),
      { heading: "Ship to", lines: addressLines(order) },
      {
        heading: "What happens next",
        lines: [
          `${SITE_NAME} will contact you by email to arrange payment by Interac e-Transfer.`,
          "After payment, orders ship by Canada Post Priority with tracking.",
          `Please include ${order.referenceNumber} with your e-Transfer.`,
        ],
      },
      ...(hasPayment
        ? [{ heading: "Payment Instructions", boxed: true, rows: paymentRows, lines: paymentText }]
        : []),
    ],
    footer: [FOOTER],
  });
  return {
    to: order.customerEmail,
    subject: `${SITE_NAME} order ${order.referenceNumber} received`,
    text,
    html,
  };
}

/**
 * The customer's shipping notification, sent only when the client presses Send shipping
 * notification: the tracking number and carrier when recorded, what shipped and where.
 */
export function shippingMessage(order: OrderForEmail): Message {
  const tracking: EmailSection = {
    heading: "Tracking",
    rows: [
      ["Carrier", order.carrier],
      ["Tracking number", order.trackingNumber],
    ],
  };
  const { html, text } = renderEmail({
    title: `Order ${order.referenceNumber} has shipped`,
    sections: [
      ...(order.carrier || order.trackingNumber ? [tracking] : []),
      {
        heading: "What was shipped",
        items: { rows: itemRows(order), totals: [] },
        lines: itemLines(order),
      },
      { heading: "Ship to", lines: addressLines(order) },
    ],
    footer: [FOOTER],
  });
  return {
    to: order.customerEmail,
    subject: `${SITE_NAME} order ${order.referenceNumber} has shipped`,
    text,
    html,
  };
}

/** Whether emails can be sent at all on this server. */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** The reason recorded when there is no API key; the admin explains it in plain words. */
export const NO_API_KEY_REASON = "RESEND_API_KEY is not set";

/**
 * Starts OrderRequest.notificationError when the failure was the shipping notification, so
 * it is never mistaken for the order emails failing.
 */
export const SHIPPING_ERROR_PREFIX = "Shipping notification: ";

/**
 * Sends each message through Resend, or logs every payload when RESEND_API_KEY is not set.
 * Never throws: the caller records the outcome on the order.
 */
async function deliver(reference: string, messages: Message[]): Promise<SendOutcome> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    for (const message of messages) {
      console.info(
        `[order-email] ${NO_API_KEY_REASON}; not sent. Payload for ${reference}:\n` +
          JSON.stringify({ to: message.to, subject: message.subject, text: message.text }, null, 2),
      );
    }
    return {
      sent: false,
      reason:
        messages.length === 1
          ? `${NO_API_KEY_REASON}; the email was logged, not sent.`
          : `${NO_API_KEY_REASON}; emails were logged, not sent.`,
    };
  }

  const resend = new Resend(apiKey);
  const from = process.env.ORDER_EMAIL_FROM?.trim() || DEFAULT_FROM;
  const failures: string[] = [];
  for (const message of messages) {
    try {
      const { error } = await resend.emails.send({ from, ...message });
      if (error) {
        failures.push(`${message.to}: ${error.message}`);
      }
    } catch (error) {
      failures.push(`${message.to}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failures.length > 0) {
    console.error(`[order-email] ${reference} not fully sent: ${failures.join("; ")}`);
    return { sent: false, reason: failures.join("; ").slice(0, 500) };
  }
  return { sent: true };
}

/**
 * Sends both order emails. Never throws: the order is already saved, so a failure is
 * reported in the result (and recorded on the order by the caller), not raised.
 */
export function sendOrderEmails(
  order: OrderForEmail,
  settings: EmailSettings,
): Promise<SendOutcome> {
  return deliver(order.referenceNumber, [
    clientMessage(order, settings),
    customerMessage(order, settings),
  ]);
}

/** Sends the shipping notification to the customer. Never throws. */
export function sendShippingEmail(order: OrderForEmail): Promise<SendOutcome> {
  return deliver(order.referenceNumber, [shippingMessage(order)]);
}
