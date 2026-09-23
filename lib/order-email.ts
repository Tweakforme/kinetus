import type { OrderRequest, OrderRequestItem } from "@prisma/client";
import { Resend } from "resend";
import { provinceName } from "@/lib/checkout-fields";
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
};

type Message = { to: string; subject: string; text: string; html: string; replyTo?: string };

export type SendOutcome = { sent: true } | { sent: false; reason: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

function addressLines(order: OrderRequest): string[] {
  return [
    order.customerName,
    order.shippingLine1,
    ...(order.shippingLine2 ? [order.shippingLine2] : []),
    `${order.shippingCity}, ${provinceName(order.shippingProvince)} ${order.shippingPostalCode}`,
    "Canada",
  ];
}

function paymentLines(settings: EmailSettings): string[] {
  const lines: string[] = [];
  if (settings.etransferEmail) {
    lines.push(`Interac e-Transfer email: ${settings.etransferEmail}`);
  }
  if (settings.etransferInstructions) {
    lines.push(settings.etransferInstructions);
  }
  return lines;
}

/** Plain HTML from sections of text lines: headings bold, everything escaped. */
function toHtml(sections: Array<{ heading?: string; lines: string[] }>): string {
  const body = sections
    .map((section) => {
      const heading = section.heading
        ? `<p style="margin:16px 0 4px;font-weight:bold">${escapeHtml(section.heading)}</p>`
        : "";
      const lines = section.lines
        .map((line) => `<p style="margin:0 0 4px">${escapeHtml(line)}</p>`)
        .join("");
      return heading + lines;
    })
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#071b34">${body}<p style="margin:24px 0 0;font-size:12px;color:#49586c">${escapeHtml(FOOTER)}</p></div>`;
}

function toText(sections: Array<{ heading?: string; lines: string[] }>): string {
  return (
    sections
      .map((section) =>
        [section.heading?.toUpperCase(), ...section.lines].filter(Boolean).join("\n"),
      )
      .join("\n\n") + `\n\n${FOOTER}\n`
  );
}

export function clientMessage(order: OrderForEmail, settings: EmailSettings): Message {
  const sections = [
    { lines: [`New order ${order.referenceNumber}`, `Placed ${order.createdAt.toISOString()}`] },
    {
      heading: "Customer",
      lines: [order.customerName, order.customerEmail, order.customerPhone],
    },
    { heading: "Ship to", lines: addressLines(order) },
    { heading: "Items", lines: itemLines(order) },
    {
      heading: "Summary",
      lines: summaryLines(order).map(([label, value]) => `${label}: ${value}`),
    },
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
  ];
  return {
    to: settings.orderNotifyEmail?.trim() || FALLBACK_NOTIFY_EMAIL,
    subject: `New order ${order.referenceNumber} (${formatCad(order.totalCents)})`,
    text: toText(sections),
    html: toHtml(sections),
    replyTo: order.customerEmail,
  };
}

export function customerMessage(order: OrderForEmail, settings: EmailSettings): Message {
  const payment = paymentLines(settings);
  const sections = [
    {
      lines: [
        `Thank you. We have received order ${order.referenceNumber}.`,
        "This email acknowledges that the order was received. It does not confirm the order, which is not confirmed until payment has been arranged.",
      ],
    },
    { heading: "What you ordered", lines: itemLines(order) },
    {
      heading: "Summary",
      lines: summaryLines(order).map(([label, value]) => `${label}: ${value}`),
    },
    { heading: "Ship to", lines: addressLines(order) },
    {
      heading: "What happens next",
      lines: [
        `${SITE_NAME} will contact you by email to arrange payment by Interac e-Transfer.`,
        "After payment, orders ship by Canada Post Priority with tracking.",
        `Please include ${order.referenceNumber} with your e-Transfer.`,
        ...payment,
      ],
    },
  ];
  return {
    to: order.customerEmail,
    subject: `${SITE_NAME} order ${order.referenceNumber} received`,
    text: toText(sections),
    html: toHtml(sections),
  };
}

/**
 * The customer's shipping notification, sent only when the client presses Send shipping
 * notification: the tracking number and carrier when recorded, what shipped and where.
 */
export function shippingMessage(order: OrderForEmail): Message {
  const tracking = [
    order.carrier ? `Carrier: ${order.carrier}` : null,
    order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : null,
  ].filter((line): line is string => line !== null);
  const sections = [
    { lines: [`Order ${order.referenceNumber} has shipped.`] },
    ...(tracking.length > 0 ? [{ heading: "Tracking", lines: tracking }] : []),
    { heading: "What was shipped", lines: itemLines(order) },
    { heading: "Ship to", lines: addressLines(order) },
  ];
  return {
    to: order.customerEmail,
    subject: `${SITE_NAME} order ${order.referenceNumber} has shipped`,
    text: toText(sections),
    html: toHtml(sections),
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
