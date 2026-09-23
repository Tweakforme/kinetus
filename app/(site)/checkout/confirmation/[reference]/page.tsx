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
  title: "Order received",
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

/**
 * /checkout/confirmation/[reference]: the order is received, not yet confirmed (the
 * client's Terms: an acknowledgement is not acceptance). References are sequential, so
 * the order's contents are shown only to the browser that placed it (a short-lived
 * cookie set at submission); anyone else with the link sees the reference and the next
 * steps only. Never listed or linked anywhere public.
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
      select: { etransferEmail: true, etransferInstructions: true },
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
        <SectionDivider id="confirmation-heading" as="h1" title="Order received" />

        <div className={styles.intro}>
          <p className={styles.referenceLabel}>Order reference</p>
          <p className={`numeric ${styles.reference}`}>{order.referenceNumber}</p>
          <p className={styles.status}>
            Your order has been received and is not yet confirmed. {SITE_NAME} will contact you by
            email to arrange payment by Interac e-Transfer.
          </p>
        </div>

        <div className={styles.layout}>
          <section className={styles.card} aria-labelledby="next-steps-heading">
            <h2 id="next-steps-heading" className={styles.heading}>
              What happens next
            </h2>
            <ol className={styles.steps}>
              <li>{SITE_NAME} emails you to arrange payment by Interac e-Transfer.</li>
              <li>
                Send the e-Transfer and include your order reference, {order.referenceNumber}.
              </li>
              <li>After payment, orders ship by Canada Post Priority with tracking.</li>
            </ol>
            {(settings?.etransferEmail || settings?.etransferInstructions) && (
              <div className={styles.etransfer}>
                <h3 className={styles.subheading}>Interac e-Transfer</h3>
                {settings.etransferEmail && (
                  <p>
                    Send to:{" "}
                    <span className={styles.etransferEmail}>{settings.etransferEmail}</span>
                  </p>
                )}
                {settings.etransferInstructions && (
                  <p className={styles.instructions}>{settings.etransferInstructions}</p>
                )}
              </div>
            )}
            {isPlacer && (
              <p className={styles.emailNote}>
                A copy of this order was sent to {order.customerEmail}.
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
                Order details are shown only in the browser that placed the order, and in the email
                sent to the address given at checkout.
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
