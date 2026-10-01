import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSummary, type SummaryFigures } from "@/components/cart/OrderSummary";
import { ListingPage } from "@/components/collection/ListingPage";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { REFERENCE_PATTERN } from "@/lib/checkout-fields";
import { prisma } from "@/lib/db";
import { ORDER_COOKIE } from "@/lib/order-cookie";
import { formatCad } from "@/lib/pricing";
import { SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

type ConfirmationPageProps = {
  params: Promise<{ reference: string }>;
};

export const metadata: Metadata = {
  title: "Thank you for your order",
  robots: { index: false, follow: false },
};

/** Stored order figures in the summary's shape; nothing is recalculated. */
function storedFigures(order: {
  subtotalCents: number;
  volumeDiscountCents: number;
  codeDiscountCents: number;
  discountCodeUsed: string | null;
  shippingCents: number;
  taxCents: number;
  taxLabel: string | null;
  taxRateBps: number;
  totalCents: number;
}): SummaryFigures {
  return {
    subtotalCents: order.subtotalCents,
    volumeDiscountCents: order.volumeDiscountCents,
    volumePercent: null,
    codeDiscountCents: order.codeDiscountCents,
    code: order.discountCodeUsed,
    shippingCents: order.shippingCents,
    // Only the amount is stored; "Free" shows for any zero shipping.
    shippingReason: order.shippingCents > 0 ? "flat" : "threshold",
    taxEnabled: order.taxLabel !== null || order.taxCents > 0,
    taxCents: order.taxCents,
    taxLabel: order.taxLabel,
    totalCents: order.totalCents,
  };
}

/** The Payment Instructions lines that have a value, in display order. */
function paymentRows(
  settings: {
    etransferEmail: string | null;
    payeeName: string | null;
    securityQuestion: string | null;
    securityAnswer: string | null;
  } | null,
): Array<[string, string]> {
  const rows: Array<[string, string | null | undefined]> = [
    ["Send an Interac e-Transfer to", settings?.etransferEmail],
    ["Payee name", settings?.payeeName],
    ["Security question", settings?.securityQuestion],
    ["Security answer", settings?.securityAnswer],
  ];
  return rows.filter((row): row is [string, string] => Boolean(row[1]?.trim()));
}

/**
 * /checkout/confirmation/[reference]: "Thank you for your order", the order number, then
 * the Payment Instructions, every value from StoreSetting (Admin > Settings) and each line
 * hidden while empty. Informational text only: no payment is taken here. The order is
 * received, not yet confirmed (the client's Terms: an acknowledgement is not acceptance). References are sequential, so
 * the order's contents are shown only to the browser that placed it (a short-lived
 * cookie set at submission); anyone else with the link sees the reference and the next
 * steps only. Never listed or linked anywhere public. It says an email was sent only when
 * the order records one (notificationSentAt).
 */
export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { reference } = await params;
  if (!REFERENCE_PATTERN.test(reference)) {
    notFound();
  }
  const [order, settings, cookieStore] = await Promise.all([
    prisma.orderRequest.findUnique({
      where: { referenceNumber: reference },
      include: { items: { orderBy: { id: "asc" } } },
    }),
    prisma.storeSetting.findUnique({
      where: { id: "store" },
      select: {
        etransferEmail: true,
        etransferInstructions: true,
        payeeName: true,
        securityQuestion: true,
        securityAnswer: true,
        holdPeriodText: true,
      },
    }),
    cookies(),
  ]);
  if (!order) {
    notFound();
  }
  const isPlacer = cookieStore.get(ORDER_COOKIE)?.value === reference;

  return (
    <ListingPage padTop>
      <Container as="section" className={styles.section} aria-labelledby="confirmation-heading">
        <SectionDivider id="confirmation-heading" as="h1" title="Thank you for your order" />

        <div className={styles.intro}>
          <p className={styles.referenceLabel}>Order number</p>
          <p className={`numeric ${styles.reference}`}>{order.referenceNumber}</p>
          <p className={styles.status}>
            Your order has been received and is not yet confirmed. {SITE_NAME} will contact you by
            email to arrange payment by Interac e-Transfer.
          </p>
        </div>

        <div className={styles.layout}>
          <section className={styles.card} aria-labelledby="payment-heading">
            <h2 id="payment-heading" className={styles.heading}>
              Payment Instructions
            </h2>
            <dl className={styles.payment}>
              {paymentRows(settings).map(([label, value]) => (
                <div key={label} className={styles.paymentRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {settings?.holdPeriodText && (
              <p className={styles.instructions}>{settings.holdPeriodText}</p>
            )}
            {settings?.etransferInstructions && (
              <p className={styles.instructions}>{settings.etransferInstructions}</p>
            )}
            <p className={styles.include}>
              Include your order number, <span className="numeric">{order.referenceNumber}</span>,
              in the e-Transfer message.
            </p>
            <p>After payment, orders ship by Canada Post Priority with tracking.</p>
            {isPlacer && (
              <p className={styles.emailNote}>
                {order.notificationSentAt
                  ? `A copy of this order was sent to ${order.customerEmail}.`
                  : `${SITE_NAME} will be in touch by email shortly.`}
              </p>
            )}
          </section>

          {isPlacer ? (
            <aside className={styles.card} aria-label="Order summary">
              <OrderSummary
                figures={storedFigures(order)}
                headingId="confirmation-summary-heading"
              />
              <ul className={styles.lines} aria-label="Items">
                {order.items.map((item) => (
                  <li key={item.id} className={styles.line}>
                    <span className={styles.lineName}>
                      {item.productNameSnapshot}{" "}
                      <span className={styles.lineVariant}>{item.variantLabelSnapshot}</span>
                      <span className={styles.lineQuantity}> &times; {item.quantity}</span>
                    </span>
                    <span className={`numeric ${styles.lineTotal}`}>
                      {formatCad(item.lineTotalCents)}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <aside className={styles.card} aria-label="Order details">
              <p className={styles.private}>
                {order.notificationSentAt
                  ? "Order details are shown only in the browser that placed the order, and in the email sent to the address given at checkout."
                  : "Order details are shown only in the browser that placed the order."}
              </p>
            </aside>
          )}
        </div>

        <div className={styles.actions}>
          <Link href="/products" className={buttons.outline}>
            Continue browsing
          </Link>
        </div>
      </Container>
    </ListingPage>
  );
}
