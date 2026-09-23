import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { checkDiscountCode, getPricingContext, resolveCart, type CartEntry } from "@/lib/cart";
import { formatReference, type CheckoutDetails } from "@/lib/checkout-fields";
import { prisma } from "@/lib/db";
import { sendOrderEmails, type OrderForEmail } from "@/lib/order-email";
import { DISCOUNT_CODE_MESSAGES, priceCart } from "@/lib/pricing";

/**
 * Order placement. Everything the order stores is recomputed here from the database
 * (lines, stock, code, settings, pricing) inside one transaction; nothing submitted by the
 * browser except the address, the checkboxes and the cookie's variant ids and quantities
 * is used. Stock is not decremented: that happens when the client marks an order paid.
 */

/** A problem the customer can act on. Rolls the transaction back; the cart is kept. */
export class CheckoutError extends Error {}

/* -------------------------------------------------------------------------- */
/*  Rate limiting                                                             */
/* -------------------------------------------------------------------------- */

const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 10;

export async function requestIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
}

/** Records the submission and says whether this address is over the limit. */
export async function recordCheckoutAttempt(ip: string): Promise<{ id: string; limited: boolean }> {
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const recent = await prisma.checkoutAttempt.count({ where: { ip, createdAt: { gte: since } } });
  const attempt = await prisma.checkoutAttempt.create({
    data: { ip, success: false },
    select: { id: true },
  });
  return { id: attempt.id, limited: recent >= MAX_ATTEMPTS_PER_IP };
}

export async function markAttemptSucceeded(id: string): Promise<void> {
  await prisma.checkoutAttempt.update({ where: { id }, data: { success: true } });
}

/* -------------------------------------------------------------------------- */
/*  Placing the order                                                         */
/* -------------------------------------------------------------------------- */

const STORE_TIME_ZONE = "America/Edmonton";

/**
 * The two raw statements below name their schema. Prisma's `?schema=` reaches its own
 * queries, but behind the connection pooler a raw statement runs with whatever
 * search_path the pooled session has, which is not guaranteed to be that schema.
 */
const SCHEMA = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? "").searchParams.get("schema") || "public";
  } catch {
    return "public";
  }
})();

function table(name: "OrderSequence" | "DiscountCode"): Prisma.Sql {
  return Prisma.raw(`"${SCHEMA.replace(/"/g, '""')}"."${name}"`);
}

/** Order year in Calgary time, so a New Year's Eve evening order is not numbered next year. */
function storeYear(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: STORE_TIME_ZONE, year: "numeric" }).format(now),
  );
}

/**
 * Next number for the year. The upsert takes a row lock, so concurrent transactions queue
 * here and each receives a distinct, consecutive number; a rolled-back order releases its
 * number with the rest of the transaction.
 */
async function nextReference(tx: Prisma.TransactionClient, year: number): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ last: number }>>`
    INSERT INTO ${table("OrderSequence")} AS seq ("year", "last") VALUES (${year}, 1)
    ON CONFLICT ("year") DO UPDATE SET "last" = seq."last" + 1
    RETURNING "last"`;
  const last = rows[0]?.last;
  if (typeof last !== "number") {
    throw new Error("Order sequence did not return a number.");
  }
  return formatReference(year, last);
}

/** Counts a redemption only while the code is still usable; false when it is not. */
async function redeemCode(tx: Prisma.TransactionClient, code: string, now: Date): Promise<boolean> {
  const updated = await tx.$executeRaw`
    UPDATE ${table("DiscountCode")}
    SET "timesRedeemed" = "timesRedeemed" + 1, "updatedAt" = ${now}
    WHERE "code" = ${code}
      AND "isActive" = true
      AND ("startsAt" IS NULL OR "startsAt" <= ${now})
      AND ("endsAt" IS NULL OR "endsAt" >= ${now})
      AND ("maxRedemptions" IS NULL OR "timesRedeemed" < "maxRedemptions")`;
  return updated === 1;
}

export type PlaceOrderInput = {
  entries: CartEntry[];
  codeInput: string | null;
  details: CheckoutDetails;
};

const orderInclude = { items: true } satisfies Prisma.OrderRequestInclude;

/**
 * Creates the order and its items in one transaction and returns it. Throws CheckoutError
 * for anything the customer can fix (cart changed, stock, code no longer valid).
 */
export async function placeOrder(input: PlaceOrderInput, now = new Date()): Promise<OrderForEmail> {
  const { entries, codeInput, details } = input;
  if (entries.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }

  return prisma.$transaction(
    async (tx) => {
      const resolved = await resolveCart(entries, now, tx);
      if (resolved.unavailableCount > 0) {
        throw new CheckoutError(
          "An item in your cart is no longer available. Review your cart and try again.",
        );
      }
      const short = resolved.lines.find((line) => line.shortfall > 0);
      if (short) {
        throw new CheckoutError(
          short.available === 0
            ? `${short.productName} ${short.variantLabel} is out of stock. Remove it from your cart to continue.`
            : `Only ${short.available} of ${short.productName} ${short.variantLabel} are available. Update your cart to continue.`,
        );
      }

      const context = await getPricingContext(tx);
      const codeCheck = await checkDiscountCode(codeInput, now, tx);
      if (codeCheck.status === "invalid") {
        throw new CheckoutError(
          `The discount code ${codeCheck.input} can no longer be used. ${DISCOUNT_CODE_MESSAGES[codeCheck.problem]} Remove it from your cart to continue.`,
        );
      }

      const summary = priceCart({
        lines: resolved.lines,
        tiers: context.tiers,
        code: codeCheck.status === "valid" ? codeCheck.code : null,
        settings: context.settings,
        taxRates: context.taxRates,
        destination: { city: details.city, province: details.province },
      });

      // A code is redeemed only when it actually reduced the total.
      if (summary.appliedCode && !(await redeemCode(tx, summary.appliedCode.code, now))) {
        throw new CheckoutError(
          `The discount code ${summary.appliedCode.code} has just reached its redemption limit. Remove it from your cart to continue.`,
        );
      }

      const referenceNumber = await nextReference(tx, storeYear(now));

      return tx.orderRequest.create({
        data: {
          referenceNumber,
          customerName: details.name,
          customerEmail: details.email,
          customerPhone: details.phone,
          shippingLine1: details.line1,
          shippingLine2: details.line2,
          shippingCity: details.city,
          shippingProvince: details.province,
          shippingPostalCode: details.postalCode,
          shippingCountry: "CA",
          note: details.note,
          ageConfirmed: details.ageConfirmed,
          researchUseAcknowledged: details.researchUse,
          subtotalCents: summary.subtotalCents,
          volumeDiscountCents: summary.volumeDiscountCents,
          codeDiscountCents: summary.codeDiscountCents,
          discountCodeUsed: summary.appliedCode?.code ?? null,
          shippingCents: summary.shippingCents,
          taxRateBps: summary.taxRateBps,
          taxLabel: summary.taxLabel,
          taxCents: summary.taxCents ?? 0,
          totalCents: summary.totalCents,
          createdAt: now,
          items: {
            create: resolved.lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              productNameSnapshot: line.productName,
              variantLabelSnapshot: line.variantLabel,
              skuSnapshot: line.sku ?? "",
              unitPriceSnapshot: line.unitPriceCents,
              quantity: line.quantity,
              lineTotalCents: line.lineTotalCents,
            })),
          },
        },
        include: orderInclude,
      });
    },
    {
      maxWait: 15_000,
      timeout: 20_000,
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
}

/** Sends the order emails and records the outcome on the order. Never throws. */
export async function notifyOrder(order: OrderForEmail): Promise<void> {
  try {
    const settings = await prisma.storeSetting.findUnique({
      where: { id: "store" },
      select: { orderNotifyEmail: true, etransferEmail: true, etransferInstructions: true },
    });
    const outcome = await sendOrderEmails(order, {
      orderNotifyEmail: settings?.orderNotifyEmail ?? null,
      etransferEmail: settings?.etransferEmail ?? null,
      etransferInstructions: settings?.etransferInstructions ?? null,
    });
    await prisma.orderRequest.update({
      where: { id: order.id },
      data: outcome.sent
        ? { notificationSentAt: new Date(), notificationError: null }
        : { notificationError: outcome.reason },
    });
  } catch (error) {
    console.error(`[order-email] ${order.referenceNumber}: notification step failed`, error);
  }
}
