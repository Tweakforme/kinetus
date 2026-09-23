"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { figuresFromSummary, type SummaryFigures } from "@/components/cart/OrderSummary";
import { loadPricedCart, readCart, readCodeInput, writeCart, writeCodeInput } from "@/lib/cart";
import { FIELD, PROVINCES, validateCheckout, type FieldErrors } from "@/lib/checkout-fields";
import { ORDER_COOKIE, ORDER_COOKIE_PATH } from "@/lib/order-cookie";
import {
  CheckoutError,
  markAttemptSucceeded,
  notifyOrder,
  placeOrder,
  recordCheckoutAttempt,
  requestIp,
} from "@/lib/orders";

export type CheckoutState = {
  status: "idle" | "error";
  message?: string;
  errors?: FieldErrors;
  /** The submitted values, so the form keeps them after a failed attempt. */
  values?: Record<string, string>;
  /** Changes on every failed submission, so the form remounts with the echoed values. */
  attempt?: number;
};

const ECHOED = [
  FIELD.name,
  FIELD.email,
  FIELD.phone,
  FIELD.line1,
  FIELD.line2,
  FIELD.city,
  FIELD.province,
  FIELD.postalCode,
  FIELD.note,
  FIELD.age,
  FIELD.research,
];

const GENERIC_FAILURE =
  "Your order could not be placed. Your cart has not changed. Please try again in a moment.";

/**
 * Places the order. Runs every check on the server whatever the browser did: rate limit,
 * honeypot, every field, both confirmations, then placeOrder re-resolves the cart, stock
 * and code and prices it inside one transaction. On success the cart is cleared, the
 * emails go out (or are logged) and the customer lands on the confirmation page.
 */
export async function submitOrder(
  _previous: CheckoutState,
  form: FormData,
): Promise<CheckoutState> {
  const get = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };
  const values = Object.fromEntries(ECHOED.map((name) => [name, get(name).slice(0, 1000)]));
  const failed = (state: Omit<CheckoutState, "status" | "values" | "attempt">): CheckoutState => ({
    status: "error",
    values,
    attempt: Date.now(),
    ...state,
  });

  const ip = await requestIp();
  const attempt = await recordCheckoutAttempt(ip);
  if (attempt.limited) {
    return failed({
      message:
        "Too many order attempts from this connection. Please wait 15 minutes and try again.",
    });
  }
  // Bots fill the hidden field; people never see it. Say nothing specific.
  if (get(FIELD.honeypot) !== "") {
    return failed({ message: GENERIC_FAILURE });
  }

  const validation = validateCheckout(get);
  if (!validation.ok) {
    return failed({
      message: "Please correct the highlighted fields.",
      errors: validation.errors,
    });
  }

  const [entries, codeInput] = await Promise.all([readCart(), readCodeInput()]);

  let order: Awaited<ReturnType<typeof placeOrder>>;
  try {
    order = await placeOrder({ entries, codeInput, details: validation.details });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return failed({ message: error.message });
    }
    console.error("[checkout] order failed", error);
    return failed({ message: GENERIC_FAILURE });
  }

  // The order is saved. Nothing below may report a failure, or the customer would retry
  // and place it twice.
  const reference = order.referenceNumber;
  await markAttemptSucceeded(attempt.id).catch(() => {});
  await Promise.all([writeCart([]), writeCodeInput(null)]);
  (await cookies()).set(ORDER_COOKIE, reference, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: ORDER_COOKIE_PATH,
    maxAge: 60 * 60 * 24,
  });
  await notifyOrder(order);

  redirect(`/checkout/confirmation/${reference}`);
}

/**
 * Totals for the address typed so far (local delivery, and tax once enabled), priced on
 * the server from the cart cookie. Display only; submitOrder prices everything again.
 */
export async function quoteCheckout(
  city: unknown,
  province: unknown,
): Promise<SummaryFigures | null> {
  const provinceCode =
    typeof province === "string" ? PROVINCES.find((item) => item.code === province)?.code : null;
  const cityName = typeof city === "string" ? city.slice(0, 100) : "";
  const cart = await loadPricedCart(
    provinceCode && cityName.trim() ? { city: cityName, province: provinceCode } : null,
  );
  if (cart.lines.length === 0) {
    return null;
  }
  return figuresFromSummary(cart.summary);
}
