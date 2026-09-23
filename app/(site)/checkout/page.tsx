import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm, type CheckoutLine } from "@/components/checkout/CheckoutForm";
import { figuresFromSummary } from "@/components/cart/OrderSummary";
import { ListingPage } from "@/components/collection/ListingPage";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { loadPricedCart } from "@/lib/cart";
import { DISCOUNT_CODE_MESSAGES } from "@/lib/pricing";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/**
 * /checkout: the shipping details form and both confirmations on the left, the order
 * summary on the right, recalculated on the server. Rendered per request from the cart
 * cookie. An empty cart goes back to /cart; a stock or code problem is explained here and
 * blocks submission on the server.
 */
export default async function CheckoutPage() {
  const cart = await loadPricedCart(null);
  if (cart.lines.length === 0) {
    redirect("/cart");
  }

  const lines: CheckoutLine[] = cart.lines.map((line) => ({
    variantId: line.variantId,
    name: line.productName,
    variantLabel: line.variantLabel,
    quantity: line.quantity,
    lineTotalCents: line.lineTotalCents,
  }));
  const stockProblems = cart.lines
    .filter((line) => line.shortfall > 0)
    .map((line) =>
      line.available === 0
        ? `${line.productName} ${line.variantLabel} is out of stock.`
        : `Only ${line.available} of ${line.productName} ${line.variantLabel} are available.`,
    );
  const codeProblem =
    cart.codeCheck.status === "invalid"
      ? `The discount code ${cart.codeCheck.input} can no longer be used. ${DISCOUNT_CODE_MESSAGES[cart.codeCheck.problem]}`
      : null;

  return (
    <ListingPage padTop>
      <Container as="section" className={styles.section} aria-labelledby="checkout-heading">
        <SectionDivider id="checkout-heading" as="h1" title="Checkout" />

        {cart.unavailableCount > 0 && (
          <p className={styles.notice} role="status">
            An item in your cart is no longer available and has been removed.
          </p>
        )}
        {stockProblems.length > 0 && (
          <p className={styles.notice} role="alert">
            {stockProblems.join(" ")}{" "}
            <Link href="/cart" className={styles.noticeLink}>
              Update your cart
            </Link>{" "}
            to continue.
          </p>
        )}
        {codeProblem && (
          <p className={styles.notice} role="alert">
            {codeProblem}{" "}
            <Link href="/cart" className={styles.noticeLink}>
              Remove it on the cart page
            </Link>
            .
          </p>
        )}

        <CheckoutForm lines={lines} initialFigures={figuresFromSummary(cart.summary)} />
      </Container>
    </ListingPage>
  );
}
