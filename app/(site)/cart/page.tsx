import type { Metadata } from "next";
import Link from "next/link";
import { CartLines, type CartLineView } from "@/components/cart/CartLines";
import { DiscountCodeForm, type CodeStatus } from "@/components/cart/DiscountCodeForm";
import { figuresFromSummary, OrderSummary } from "@/components/cart/OrderSummary";
import { ShippingPanel } from "@/components/cart/ShippingPanel";
import { ListingPage } from "@/components/collection/ListingPage";
import { ArrowRightIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { loadPricedCart, type PricedCart } from "@/lib/cart";
import { DISCOUNT_CODE_MESSAGES, formatCad } from "@/lib/pricing";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

function codeStatus(cart: PricedCart): CodeStatus {
  const { codeCheck, summary } = cart;
  if (codeCheck.status === "none") {
    return { kind: "none" };
  }
  if (codeCheck.status === "invalid") {
    return {
      kind: "invalid",
      code: codeCheck.input,
      message: DISCOUNT_CODE_MESSAGES[codeCheck.problem],
    };
  }
  // A valid code always applies: it replaces the volume discount (lib/pricing.ts).
  return {
    kind: "applied",
    code: codeCheck.code.code,
    percentOff: codeCheck.code.percentOff,
    savingLabel: formatCad(summary.codeDiscountCents),
  };
}

/**
 * /cart (deck slide 21): line items, the discount code field, the order summary, the
 * shipping panel and Proceed to Checkout. Rendered per request from the cart cookie;
 * every price comes from the database, never from the cookie.
 */
export default async function CartPage() {
  const cart = await loadPricedCart(null);
  const { lines, summary, context } = cart;
  const blocked = lines.some((line) => line.shortfall > 0);
  const lineViews: CartLineView[] = lines.map((line) => ({
    variantId: line.variantId,
    productSlug: line.productSlug,
    productName: line.productName,
    variantLabel: line.variantLabel,
    unitPriceCents: line.unitPriceCents,
    compareAtCents: line.compareAtCents,
    quantity: line.quantity,
    lineTotalCents: line.lineTotalCents,
    imageUrl: line.imageUrl,
    imageAlt: line.imageAlt,
    available: line.available,
    shortfall: line.shortfall,
  }));

  return (
    <ListingPage padTop>
      <Container as="section" className={styles.section} aria-labelledby="cart-heading">
        <SectionDivider id="cart-heading" as="h1" title="Cart" />

        {cart.unavailableCount > 0 && (
          <p className={styles.notice} role="status">
            {cart.unavailableCount === 1
              ? "An item in your cart is no longer available and has been removed."
              : "Some items in your cart are no longer available and have been removed."}
          </p>
        )}

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Your cart is empty.</p>
            <Link href="/products" className={buttons.solid}>
              Browse products
              <ArrowRightIcon size={20} />
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.main}>
              <CartLines lines={lineViews} />
              <DiscountCodeForm status={codeStatus(cart)} />
            </div>

            <aside className={styles.side} aria-label="Cart totals">
              <div className={styles.card}>
                <OrderSummary
                  figures={figuresFromSummary(summary)}
                  headingId="cart-totals-heading"
                  heading="Cart totals"
                  localFreeCityBeforeAddress={context.settings.localFreeCity}
                  volumeReplacedByCode={summary.volumeReplacedByCode}
                />
                {blocked ? (
                  <p className={styles.blocked} role="alert">
                    Some items exceed the stock available. Adjust them to continue.
                  </p>
                ) : (
                  <Link href="/checkout" className={`${buttons.solid} ${styles.checkout}`}>
                    Proceed to checkout
                    <ArrowRightIcon size={20} />
                  </Link>
                )}
              </div>
              <ShippingPanel
                shippingFlatCents={context.settings.shippingFlatCents}
                freeShippingThresholdCents={context.settings.freeShippingThresholdCents}
                localFreeCity={context.settings.localFreeCity}
              />
            </aside>
          </div>
        )}
      </Container>
    </ListingPage>
  );
}
