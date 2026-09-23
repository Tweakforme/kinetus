import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OnOffBadge, OrderStatusBadge, WarningBadge } from "@/components/admin/Badges";
import { CopyButton } from "@/components/admin/CopyButton";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { formatStoreDateTime } from "@/lib/admin/forms";
import { getOrderByReference, lineName, previewStock, type OrderDetail } from "@/lib/admin/orders";
import { AGE_STATEMENT, REFERENCE_PATTERN, RESEARCH_STATEMENT } from "@/lib/checkout-fields";
import {
  emailConfigured,
  NO_API_KEY_REASON,
  SHIPPING_ERROR_PREFIX,
  summaryLines,
} from "@/lib/order-email";
import {
  ATTENTION_STATUSES,
  correctionTargets,
  describeStock,
  NEXT_STATUSES,
  ORDER_STATUS_LABEL,
  STATUS_ACTION_LABEL,
  whyNoStockMove,
  type OrderStatus,
} from "@/lib/order-status";
import { formatCad } from "@/lib/pricing";
import { SITE_NAME } from "@/lib/site";
import { EmailActions, PrivateNotesForm, TrackingForm } from "../OrderForms";
import { StatusActions, type StatusOption } from "../StatusActions";

type Props = PageProps<"/admin/orders/[reference]">;

/** References are matched without regard to case, as customers type them. */
function referenceFrom(value: string): string | null {
  const reference = value.trim().toUpperCase();
  return REFERENCE_PATTERN.test(reference) ? reference : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reference = referenceFrom((await params).reference);
  return { title: reference ? `Order ${reference}` : "Order not found" };
}

const TITLE: Record<OrderStatus, (reference: string) => string> = {
  NEW: (reference) => `Move ${reference} back to New?`,
  AWAITING_PAYMENT: (reference) => `Mark ${reference} as awaiting payment?`,
  PAID: (reference) => `Mark ${reference} as paid?`,
  SHIPPED: (reference) => `Mark ${reference} as shipped?`,
  CANCELLED: (reference) => `Cancel ${reference}?`,
};

const MEANING: Record<OrderStatus, string> = {
  NEW: "The order goes back to New, as if it had just been received.",
  AWAITING_PAYMENT:
    "Shows that payment has been requested from the customer and has not arrived yet.",
  PAID: "Records that the Interac e-Transfer for this order has arrived.",
  SHIPPED: "Records that the order has been sent. The tracking details are optional.",
  CANCELLED:
    "The order stays in the list, marked Cancelled. It can be reopened later with Correct a mistaken status.",
};

/** One status change, described from the stock levels as they are now. */
function statusOption(order: OrderDetail, target: OrderStatus, correction: boolean): StatusOption {
  const plan = previewStock(order, target);
  const stock = describeStock(plan, "will");
  if (plan.move === "none") {
    stock.push(whyNoStockMove(target));
  }
  const from = ORDER_STATUS_LABEL[order.status];
  const to = ORDER_STATUS_LABEL[target];
  return {
    target,
    buttonLabel: correction ? to : STATUS_ACTION_LABEL[target],
    confirmLabel: correction ? `Change to ${to}` : STATUS_ACTION_LABEL[target],
    title: correction
      ? `Change ${order.referenceNumber} from ${from} to ${to}?`
      : TITLE[target](order.referenceNumber),
    meaning: MEANING[target],
    stock,
    oversold: plan.lines.some((line) => line.after < 0),
    primary: !correction && NEXT_STATUSES[order.status][0] === target,
    danger: target === "CANCELLED",
  };
}

/** The address as it goes on a label: province code, two spaces, postal code. */
function labelLines(order: OrderDetail): string[] {
  return [
    order.customerName,
    order.shippingLine1,
    ...(order.shippingLine2 ? [order.shippingLine2] : []),
    `${order.shippingCity} ${order.shippingProvince}  ${order.shippingPostalCode}`,
    order.shippingCountry === "CA" ? "Canada" : order.shippingCountry,
  ];
}

/** The recorded email failure, in plain words. */
function emailProblem(error: string): string {
  const shipping = error.startsWith(SHIPPING_ERROR_PREFIX);
  const reason = shipping ? error.slice(SHIPPING_ERROR_PREFIX.length) : error;
  const why = reason.includes(NO_API_KEY_REASON)
    ? `email is not set up on this server (RESEND_API_KEY is missing), so ${shipping ? "it was" : "they were"} written to the server log instead`
    : reason.replace(/\.$/, "");
  return `${shipping ? "The shipping notification was" : "The order emails were"} not sent: ${why}.`;
}

function StockNote({ item }: { item: OrderDetail["items"][number] }) {
  if (!item.variant) {
    return <span className={styles.stockNote}>This size is no longer in the catalogue.</span>;
  }
  if (!item.variant.trackInventory) {
    return <span className={styles.stockNote}>Stock is not tracked for this size.</span>;
  }
  const stock = item.variant.stock ?? 0;
  if (stock < 0) {
    return (
      <span className={`${styles.stockNote} ${styles.stockNoteWarn}`}>
        In stock now: {stock}. Oversold by {-stock}.
      </span>
    );
  }
  return <span className={styles.stockNote}>In stock now: {stock}</span>;
}

/**
 * /admin/orders/[reference]: one order, as it was placed. Every name, price and total
 * comes from what the order stored at checkout; only current stock levels are read from
 * the catalogue. Routed by reference, which is what emails show and customers quote.
 */
export default async function OrderDetailPage({ params }: Props) {
  await requireAdmin();
  const reference = referenceFrom((await params).reference);
  const order = reference ? await getOrderByReference(reference) : null;
  if (!order) {
    notFound();
  }

  const status = order.status;
  const next = NEXT_STATUSES[status].map((target) => statusOption(order, target, false));
  const corrections = correctionTargets(status).map((target) => statusOption(order, target, true));
  const showTracking =
    status === "SHIPPED" || order.trackingNumber !== null || order.carrier !== null;
  const address = labelLines(order);
  const oversold = order.items.filter(
    (item) => item.variant?.trackInventory && (item.variant.stock ?? 0) < 0,
  );
  const mailto = `mailto:${order.customerEmail}?subject=${encodeURIComponent(
    `${SITE_NAME} order ${order.referenceNumber}`,
  )}`;

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Link href="/admin/orders" className={styles.backLink}>
            Back to orders
          </Link>
          <h1 className={styles.pageTitle}>{order.referenceNumber}</h1>
          <p className={styles.pageIntro}>
            <OrderStatusBadge status={status} /> Total{" "}
            <span className={styles.mono}>{formatCad(order.totalCents)}</span>, placed{" "}
            {formatStoreDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {!order.notificationSentAt && (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>The customer has not been emailed about this order.</p>
          <p>
            Nothing reached them automatically. Contact {order.customerName} directly at{" "}
            {order.customerEmail} or <span className={styles.nowrap}>{order.customerPhone}</span>
            {ATTENTION_STATUSES.includes(status) ? " to arrange payment" : ""}.
          </p>
        </div>
      )}

      {oversold.length > 0 && (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          <p className={styles.noticeTitle}>Oversold</p>
          <p>
            {oversold
              .map((item) => `${lineName(item)} is at ${item.variant?.stock ?? 0}`)
              .join("; ")}
            . More units are marked paid than were in stock. Update the count on the product page
            once you restock.
          </p>
        </div>
      )}

      <section className={styles.panel} aria-labelledby="status-heading">
        <h2 id="status-heading" className={styles.panelTitle}>
          Status
        </h2>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Status</dt>
            <dd>
              <OrderStatusBadge status={status} />
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Placed</dt>
            <dd>{formatStoreDateTime(order.createdAt)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Paid</dt>
            <dd>{order.paidAt ? formatStoreDateTime(order.paidAt) : "Not recorded"}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Shipped</dt>
            <dd>{order.shippedAt ? formatStoreDateTime(order.shippedAt) : "Not recorded"}</dd>
          </div>
          {showTracking && (
            <>
              <div className={styles.fact}>
                <dt>Carrier</dt>
                <dd className={styles.selectable}>{order.carrier ?? "Not recorded"}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Tracking number</dt>
                <dd className={`${styles.selectable} ${styles.mono}`}>
                  {order.trackingNumber ?? "Not recorded"}
                </dd>
              </div>
            </>
          )}
        </dl>

        <StatusActions
          orderId={order.id}
          status={status}
          next={next}
          corrections={corrections}
          shipping={{
            trackingNumber: order.trackingNumber ?? "",
            carrier: order.carrier ?? "Canada Post",
          }}
          finalNote={
            status === "SHIPPED"
              ? "Shipped is the last step. To change it, use Correct a mistaken status."
              : "This order is cancelled. To reopen it, use Correct a mistaken status."
          }
        />

        {showTracking && (
          <details className={styles.correct}>
            <summary className={styles.correctSummary}>Edit tracking details</summary>
            <TrackingForm
              orderId={order.id}
              trackingNumber={order.trackingNumber ?? ""}
              carrier={order.carrier ?? ""}
            />
          </details>
        )}
      </section>

      <div className={styles.pairs}>
        <section className={styles.panel} aria-labelledby="customer-heading">
          <h2 id="customer-heading" className={styles.panelTitle}>
            Customer
          </h2>
          <dl className={`${styles.facts} ${styles.factsSingle}`}>
            <div className={styles.fact}>
              <dt>Name</dt>
              <dd className={styles.selectable}>{order.customerName}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Email</dt>
              <dd className={styles.selectable}>{order.customerEmail}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Phone</dt>
              <dd className={styles.selectable}>{order.customerPhone}</dd>
            </div>
          </dl>
          <p className={styles.contactLinks}>
            <a href={mailto} className={styles.textButton}>
              Write an email
            </a>
            <a href={`tel:${order.customerPhone}`} className={styles.textButton}>
              Call
            </a>
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="ship-heading">
          <h2 id="ship-heading" className={styles.panelTitle}>
            Ship to
          </h2>
          <p id="ship-to-address" className={styles.address}>
            {address.join("\n")}
          </p>
          <CopyButton
            text={address.join("\n")}
            sourceId="ship-to-address"
            label="Copy address"
            copiedMessage="Address copied."
          />
        </section>
      </div>

      <section className={styles.panel} aria-labelledby="items-heading">
        <h2 id="items-heading" className={styles.panelTitle}>
          Items
        </h2>
        <p className={styles.panelIntro}>
          As ordered: names, sizes and prices are the ones the customer saw at checkout.
        </p>
        <ul className={`${styles.records} ${styles.itemRecords}`} aria-label="Items">
          <li className={styles.recordsHead} aria-hidden="true">
            <span>Product and size</span>
            <span>SKU</span>
            <span className={styles.alignEnd}>Unit price</span>
            <span className={styles.alignEnd}>Qty</span>
            <span className={styles.alignEnd}>Line total</span>
          </li>
          {order.items.map((item) => (
            <li key={item.id} className={styles.record}>
              <div className={styles.recordCell}>
                <span className={styles.recordStrong}>{item.productNameSnapshot}</span>
                <span className={styles.recordSub}>{item.variantLabelSnapshot}</span>
                <StockNote item={item} />
              </div>
              <div className={styles.recordMeta}>
                <span className={styles.recordCell}>
                  <span className={styles.recordLabel}>SKU: </span>
                  <span className={styles.mono}>{item.skuSnapshot || "None"}</span>
                </span>
                <span className={`${styles.recordCell} ${styles.alignEnd}`}>
                  <span className={styles.recordLabel}>Unit price: </span>
                  <span className={styles.mono}>{formatCad(item.unitPriceSnapshot)}</span>
                </span>
                <span className={`${styles.recordCell} ${styles.alignEnd}`}>
                  <span className={styles.recordLabel}>Quantity: </span>
                  <span className={styles.mono}>{item.quantity}</span>
                </span>
                <span className={`${styles.recordCell} ${styles.alignEnd}`}>
                  <span className={styles.recordLabel}>Line total: </span>
                  <span className={styles.mono}>{formatCad(item.lineTotalCents)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
        <dl className={styles.summary} aria-label="Order total">
          {summaryLines(order).map(([label, value], index, lines) => (
            <div
              key={`${index}-${label}`}
              className={
                index === lines.length - 1
                  ? `${styles.summaryRow} ${styles.summaryTotal}`
                  : styles.summaryRow
              }
            >
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {order.taxRateBps > 0 && (
          <p className={`${styles.hint} ${styles.alignEnd}`}>
            Tax rate recorded with the order: {(order.taxRateBps / 100).toFixed(2)}%.
          </p>
        )}
      </section>

      <div className={styles.pairs}>
        <section className={styles.panel} aria-labelledby="note-heading">
          <h2 id="note-heading" className={styles.panelTitle}>
            Note and confirmations
          </h2>
          <h3 className={styles.subTitle}>Customer&apos;s note</h3>
          <p className={styles.noteText}>{order.note ?? "No note."}</p>
          <h3 className={styles.subTitle}>Confirmed at checkout</h3>
          <ul className={styles.confirmations}>
            <li>
              <OnOffBadge on={order.ageConfirmed} onLabel="Confirmed" offLabel="Not confirmed" />
              <q>{AGE_STATEMENT}</q>
            </li>
            <li>
              <OnOffBadge
                on={order.researchUseAcknowledged}
                onLabel="Confirmed"
                offLabel="Not confirmed"
              />
              <q>{RESEARCH_STATEMENT}</q>
            </li>
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="emails-heading">
          <h2 id="emails-heading" className={styles.panelTitle}>
            Emails
          </h2>
          <dl className={`${styles.facts} ${styles.factsSingle}`}>
            <div className={styles.fact}>
              <dt>Order emails</dt>
              <dd>
                {order.notificationSentAt ? (
                  `Sent ${formatStoreDateTime(order.notificationSentAt)}`
                ) : (
                  <>
                    <WarningBadge>Not sent</WarningBadge> The customer was not emailed
                    automatically.
                  </>
                )}
              </dd>
            </div>
            {order.notificationError && (
              <div className={styles.fact}>
                <dt>Most recent email problem</dt>
                <dd>{emailProblem(order.notificationError)}</dd>
              </div>
            )}
          </dl>
          {!emailConfigured() && (
            <p className={styles.cardNote}>
              Email is not set up on this server yet, so these buttons record the attempt and send
              nothing.
            </p>
          )}
          <EmailActions
            orderId={order.id}
            customerEmail={order.customerEmail}
            shipped={status === "SHIPPED"}
            trackingNumber={order.trackingNumber}
          />
        </section>
      </div>

      <PrivateNotesForm orderId={order.id} notes={order.internalNotes ?? ""} />
    </>
  );
}
