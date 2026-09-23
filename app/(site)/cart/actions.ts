"use server";

import { ProductStatus, VariantStatus } from "@prisma/client";
import {
  availableUnits,
  checkDiscountCode,
  isVariantId,
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
  readCart,
  resolveCart,
  writeCart,
  writeCodeInput,
  type CartEntry,
} from "@/lib/cart";
import { prisma } from "@/lib/db";
import { DISCOUNT_CODE_MESSAGES } from "@/lib/pricing";

/**
 * Cart mutations. Each takes only a variant id and a quantity (or a code), checks them
 * against the database, and rewrites the cookie. Nothing here accepts or returns a price.
 */

export type CartActionResult = {
  status: "ok" | "error";
  message: string;
  /** Units in the cart afterwards, for the header count. */
  count: number;
};

function isQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

/**
 * The cookie's entries that are still purchasable. Every write starts from these, so an
 * archived or unpublished item leaves the cookie at the next change and never holds one
 * of the 20 line slots.
 */
async function liveEntries(): Promise<CartEntry[]> {
  const entries = await readCart();
  const { lines } = await resolveCart(entries, new Date());
  const live = new Set(lines.map((line) => line.variantId));
  return entries.filter((entry) => live.has(entry.variantId));
}

/** Units in a list of live entries. */
function countOf(entries: CartEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0);
}

function purchasableVariant(variantId: string) {
  return prisma.productVariant.findFirst({
    where: {
      id: variantId,
      status: VariantStatus.ACTIVE,
      product: { status: ProductStatus.PUBLISHED },
    },
    select: { id: true, trackInventory: true, stock: true },
  });
}

function stockMessage(available: number, inCart: number): string {
  if (available === 0) {
    return "This item is out of stock.";
  }
  const base = available === 1 ? "Only 1 is available" : `Only ${available} are available`;
  return inCart > 0 ? `${base}, and your cart already has ${inCart}.` : `${base}.`;
}

export async function addToCart(variantId: unknown, quantity: unknown): Promise<CartActionResult> {
  const entries = await liveEntries();
  if (!isVariantId(variantId) || !isQuantity(quantity)) {
    return { status: "error", message: "Choose a quantity from 1 to 99.", count: countOf(entries) };
  }
  const variant = await purchasableVariant(variantId);
  if (!variant) {
    return {
      status: "error",
      message: "This item is no longer available.",
      count: countOf(entries),
    };
  }

  const existing = entries.find((entry) => entry.variantId === variantId);
  const inCart = existing?.quantity ?? 0;
  const wanted = inCart + quantity;

  if (!existing && entries.length >= MAX_CART_LINES) {
    return {
      status: "error",
      message: `Your cart can hold up to ${MAX_CART_LINES} different items.`,
      count: countOf(entries),
    };
  }
  if (wanted > MAX_LINE_QUANTITY) {
    return {
      status: "error",
      message: `You can order up to ${MAX_LINE_QUANTITY} of each item${inCart > 0 ? `; your cart already has ${inCart}` : ""}.`,
      count: countOf(entries),
    };
  }
  const available = availableUnits(variant);
  if (available !== null && wanted > available) {
    return { status: "error", message: stockMessage(available, inCart), count: countOf(entries) };
  }

  const next = existing
    ? entries.map((entry) =>
        entry.variantId === variantId ? { ...entry, quantity: wanted } : entry,
      )
    : [...entries, { variantId, quantity }];
  await writeCart(next);
  return {
    status: "ok",
    message: quantity === 1 ? "Added to cart." : `${quantity} added to cart.`,
    count: countOf(next),
  };
}

export async function updateCartQuantity(
  variantId: unknown,
  quantity: unknown,
): Promise<CartActionResult> {
  const entries = await liveEntries();
  const existing = isVariantId(variantId) ? entries.find((entry) => entry.variantId === variantId) : null;
  if (!existing || !isQuantity(quantity) || quantity > MAX_LINE_QUANTITY) {
    return { status: "error", message: "Choose a quantity from 1 to 99.", count: countOf(entries) };
  }
  const variant = await purchasableVariant(existing.variantId);
  const available = variant ? availableUnits(variant) : 0;
  if (available !== null && quantity > available && quantity > existing.quantity) {
    return { status: "error", message: stockMessage(available, 0), count: countOf(entries) };
  }
  const next = entries.map((entry) =>
    entry.variantId === existing.variantId ? { ...entry, quantity } : entry,
  );
  await writeCart(next);
  return { status: "ok", message: "Quantity updated.", count: countOf(next) };
}

export async function removeFromCart(variantId: unknown): Promise<CartActionResult> {
  const entries = await liveEntries();
  const next = entries.filter((entry) => entry.variantId !== variantId);
  await writeCart(next);
  return { status: "ok", message: "Item removed.", count: countOf(next) };
}

export type CodeFormState = { status: "idle" | "ok" | "error"; message: string };

export async function applyDiscountCode(
  _previous: CodeFormState,
  form: FormData,
): Promise<CodeFormState> {
  const raw = form.get("code");
  const input = typeof raw === "string" ? raw.trim() : "";
  if (!input) {
    return { status: "error", message: "Enter a discount code." };
  }
  if (input.length > 40) {
    return { status: "error", message: DISCOUNT_CODE_MESSAGES.not_found };
  }
  const check = await checkDiscountCode(input, new Date());
  if (check.status !== "valid") {
    return {
      status: "error",
      message: DISCOUNT_CODE_MESSAGES[check.status === "invalid" ? check.problem : "not_found"],
    };
  }
  await writeCodeInput(check.code.code);
  return { status: "ok", message: `${check.code.code} applied.` };
}

export async function removeDiscountCode(): Promise<void> {
  await writeCodeInput(null);
}
