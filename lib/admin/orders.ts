import type { Prisma } from "@prisma/client";
import { prisma, rawTable } from "@/lib/db";
import {
  SHIPPING_ERROR_PREFIX,
  sendShippingEmail,
  type OrderForEmail,
  type SendOutcome,
} from "@/lib/order-email";
import {
  ATTENTION_STATUSES,
  ORDER_STATUS_LABEL,
  planStock,
  statusTimestamps,
  stockAdjustedAfter,
  stockMove,
  type OrderStatus,
  type StockPlan,
} from "@/lib/order-status";

/**
 * Orders in the admin: the attention count, one order with its lines, the status change
 * (which moves stock in the same transaction) and the shipping notification. Server only.
 * Everything shown about an order comes from what it stored when it was placed; the
 * catalogue is read only for current stock levels.
 */

/** Orders waiting on the client (New or Awaiting payment). */
export function countOrdersNeedingAttention(): Promise<number> {
  return prisma.orderRequest.count({ where: { status: { in: ATTENTION_STATUSES } } });
}

const orderDetailInclude = {
  items: {
    orderBy: { id: "asc" },
    include: {
      variant: {
        select: {
          id: true,
          stock: true,
          trackInventory: true,
          product: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.OrderRequestInclude;

export type OrderDetail = Prisma.OrderRequestGetPayload<{ include: typeof orderDetailInclude }>;

export function getOrderByReference(reference: string): Promise<OrderDetail | null> {
  return prisma.orderRequest.findUnique({
    where: { referenceNumber: reference },
    include: orderDetailInclude,
  });
}

/** What an order line is called: its snapshots, never the current catalogue. */
export function lineName(item: { productNameSnapshot: string; variantLabelSnapshot: string }) {
  return `${item.productNameSnapshot} ${item.variantLabelSnapshot}`;
}

/** What moving this order to `target` would do to stock, at current stock levels. */
export function previewStock(order: OrderDetail, target: OrderStatus): StockPlan {
  return planStock(
    order.items.map((item) => ({
      name: lineName(item),
      quantity: item.quantity,
      variant: item.variant
        ? { trackInventory: item.variant.trackInventory, stock: item.variant.stock }
        : null,
    })),
    stockMove(target, order.stockAdjusted),
  );
}

/* -------------------------------------------------------------------------- */
/*  Status changes                                                            */
/* -------------------------------------------------------------------------- */

/** Why a change was refused, in words for the admin. Nothing was changed. */
export class OrderChangeError extends Error {}

export type StatusChangeInput = {
  orderId: string;
  /** The status the admin saw. The change is refused if the order has moved on since. */
  expected: OrderStatus;
  target: OrderStatus;
  /** Recorded when the target is Shipped. */
  shipping?: { trackingNumber: string | null; carrier: string | null };
};

export type StatusChangeResult = {
  reference: string;
  from: OrderStatus;
  to: OrderStatus;
  /** What happened to stock, read back from the updated rows. */
  stock: StockPlan;
  /** Products whose stock changed, so their pages can be refreshed. */
  changedSlugs: string[];
};

type LockedOrder = {
  id: string;
  referenceNumber: string;
  status: OrderStatus;
  stockAdjusted: boolean;
  paidAt: Date | null;
};

/**
 * Moves an order to another status in one transaction: the order row is locked, checked
 * against the status the admin saw, stock is deducted or restored as `stockAdjusted` says,
 * and the flag, status and timestamps are written together. Throws OrderChangeError when
 * the change is refused; any other error rolls everything back.
 */
export async function changeOrderStatus(
  input: StatusChangeInput,
  now = new Date(),
): Promise<StatusChangeResult> {
  return prisma.$transaction(
    async (tx) => {
      // The lock holds until commit. A second change to this order (a double tap, another
      // tab) waits here, then reads this change's result and is refused, so the flag is
      // read and written by one change at a time.
      const [order] = await tx.$queryRaw<LockedOrder[]>`
        SELECT "id", "referenceNumber", "status"::text AS "status", "stockAdjusted", "paidAt"
        FROM ${rawTable("OrderRequest")}
        WHERE "id" = ${input.orderId}
        FOR UPDATE`;
      if (!order) {
        throw new OrderChangeError("This order no longer exists.");
      }
      if (order.status !== input.expected) {
        throw new OrderChangeError(
          `This order is already ${ORDER_STATUS_LABEL[order.status]}: it changed after this page was loaded. The page now shows its current state.`,
        );
      }
      if (input.target === order.status) {
        throw new OrderChangeError(`This order is already ${ORDER_STATUS_LABEL[order.status]}.`);
      }

      const move = stockMove(input.target, order.stockAdjusted);
      const stock: StockPlan = { move, lines: [], untracked: [], deleted: [] };
      const changedSlugs = new Set<string>();

      if (move !== "none") {
        // Sizes are updated in id order, so two orders that share sizes lock them in the
        // same order and cannot deadlock each other.
        const items = await tx.orderRequestItem.findMany({
          where: { orderRequestId: order.id },
          orderBy: [{ variantId: "asc" }, { id: "asc" }],
          select: {
            quantity: true,
            variantId: true,
            productNameSnapshot: true,
            variantLabelSnapshot: true,
            variant: { select: { product: { select: { slug: true } } } },
          },
        });
        for (const item of items) {
          const name = lineName(item);
          if (item.variantId === null || item.variant === null) {
            stock.deleted.push(name);
            continue;
          }
          const delta = move === "deduct" ? -item.quantity : item.quantity;
          // One statement, so the tracking check and the arithmetic see the same row. A
          // tracked size without a count counts as 0, as the storefront treats it.
          const rows = await tx.$queryRaw<Array<{ stock: number }>>`
            UPDATE ${rawTable("ProductVariant")}
            SET "stock" = COALESCE("stock", 0) + ${delta}, "updatedAt" = ${now}
            WHERE "id" = ${item.variantId} AND "trackInventory" = true
            RETURNING "stock"`;
          if (rows.length === 0) {
            stock.untracked.push(name);
            continue;
          }
          const after = Number(rows[0].stock);
          stock.lines.push({ name, before: after - delta, after });
          changedSlugs.add(item.variant.product.slug);
        }
      }

      await tx.orderRequest.update({
        where: { id: order.id },
        data: {
          status: input.target,
          stockAdjusted: stockAdjustedAfter(move, order.stockAdjusted),
          ...statusTimestamps(order.status, input.target, order.paidAt, now),
          ...(input.target === "SHIPPED" && input.shipping
            ? { trackingNumber: input.shipping.trackingNumber, carrier: input.shipping.carrier }
            : {}),
        },
      });

      return {
        reference: order.referenceNumber,
        from: order.status,
        to: input.target,
        stock,
        changedSlugs: [...changedSlugs],
      };
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
}

/* -------------------------------------------------------------------------- */
/*  Shipping notification                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Sends the shipping notification and records a failure on the order, marked as the
 * shipping notification's so it is never read as the order emails failing. A success
 * clears only an earlier shipping notification failure. Never throws.
 */
export async function notifyShipped(order: OrderForEmail): Promise<SendOutcome> {
  const outcome = await sendShippingEmail(order);
  try {
    if (!outcome.sent) {
      await prisma.orderRequest.update({
        where: { id: order.id },
        data: { notificationError: `${SHIPPING_ERROR_PREFIX}${outcome.reason}` },
      });
    } else if (order.notificationError?.startsWith(SHIPPING_ERROR_PREFIX)) {
      await prisma.orderRequest.update({
        where: { id: order.id },
        data: { notificationError: null },
      });
    }
  } catch (error) {
    console.error(
      `[order-email] ${order.referenceNumber}: could not record the shipping notification outcome`,
      error,
    );
  }
  return outcome;
}
