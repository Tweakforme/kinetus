import { formatCad, type PriceSummary } from "@/lib/pricing";
import styles from "./OrderSummary.module.css";

/** The summary lines, from priceCart or from a stored order. */
export type SummaryFigures = {
  subtotalCents: number;
  volumeDiscountCents: number;
  /** Percentage of the tier that applied, for the label. */
  volumePercent: number | null;
  codeDiscountCents: number;
  /** The code that applied, for the label. */
  code: string | null;
  shippingCents: number;
  shippingReason: "flat" | "threshold" | "local";
  taxEnabled: boolean;
  /** Null when tax is on but the province is not known yet (cart page). */
  taxCents: number | null;
  taxLabel: string | null;
  totalCents: number;
};

export function figuresFromSummary(summary: PriceSummary): SummaryFigures {
  return {
    subtotalCents: summary.subtotalCents,
    volumeDiscountCents: summary.volumeDiscountCents,
    volumePercent: summary.volumeTier?.percentOff ?? null,
    codeDiscountCents: summary.codeDiscountCents,
    code: summary.appliedCode?.code ?? null,
    shippingCents: summary.shippingCents,
    shippingReason: summary.shippingReason,
    taxEnabled: summary.taxEnabled,
    taxCents: summary.taxCents,
    taxLabel: summary.taxLabel,
    totalCents: summary.totalCents,
  };
}

type OrderSummaryProps = {
  figures: SummaryFigures;
  headingId: string;
  heading?: string;
  /** Cart page: the local free delivery city, whose discount is applied at checkout. */
  localFreeCityBeforeAddress?: string | null;
};

function shippingText(figures: SummaryFigures): string {
  if (figures.shippingCents > 0) {
    return formatCad(figures.shippingCents);
  }
  return "Free";
}

/**
 * Order summary (deck slide 21 "Cart Totals"): subtotal, the volume discount and the code
 * discount only when they apply, shipping, tax only when tax is switched on, and the total
 * in CAD. Amounts are right-aligned on tabular figures. Presentation only: every figure was
 * calculated by lib/pricing.ts on the server.
 */
export function OrderSummary({
  figures,
  headingId,
  heading = "Order summary",
  localFreeCityBeforeAddress = null,
}: OrderSummaryProps) {
  return (
    <section className={styles.summary} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {heading}
      </h2>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Subtotal</dt>
          <dd className="numeric">{formatCad(figures.subtotalCents)}</dd>
        </div>
        {figures.volumeDiscountCents > 0 && (
          <div className={`${styles.row} ${styles.discount}`}>
            <dt>
              Volume discount
              {figures.volumePercent !== null && (
                <span className={styles.detail}> ({figures.volumePercent}%)</span>
              )}
            </dt>
            <dd className="numeric">&minus;{formatCad(figures.volumeDiscountCents)}</dd>
          </div>
        )}
        {figures.codeDiscountCents > 0 && (
          <div className={`${styles.row} ${styles.discount}`}>
            <dt>
              Discount code
              {figures.code && <span className={styles.detail}> ({figures.code})</span>}
            </dt>
            <dd className="numeric">&minus;{formatCad(figures.codeDiscountCents)}</dd>
          </div>
        )}
        <div className={styles.row}>
          <dt>
            Shipping
            {figures.shippingReason === "local" && (
              <span className={styles.detail}> (local delivery)</span>
            )}
          </dt>
          <dd className="numeric">{shippingText(figures)}</dd>
        </div>
        {figures.taxEnabled && (
          <div className={styles.row}>
            <dt>{figures.taxLabel ?? "Tax"}</dt>
            <dd className="numeric">
              {figures.taxCents === null ? "At checkout" : formatCad(figures.taxCents)}
            </dd>
          </div>
        )}
        <div className={`${styles.row} ${styles.total}`}>
          <dt>
            Total <span className={styles.currency}>(CAD)</span>
          </dt>
          <dd className="numeric">{formatCad(figures.totalCents)}</dd>
        </div>
      </dl>
      {localFreeCityBeforeAddress && figures.shippingReason === "flat" && (
        <p className={styles.note}>
          Free delivery within {localFreeCityBeforeAddress} is applied at checkout.
        </p>
      )}
    </section>
  );
}
