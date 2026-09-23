import type { OrderRequestStatus } from "@prisma/client";

/**
 * Order statuses and what changing between them does. Pure (no Prisma, no Next), so
 * node:test can run it (lib/order-status.test.ts); lib/admin/orders.ts applies it inside
 * one transaction per change.
 *
 * Stock follows one rule: an order's tracked stock is deducted while it is Paid or
 * Shipped, and not otherwise. `stockAdjusted` on the order records whether it currently
 * is, so a change deducts or restores only when the flag says the stock is on the other
 * side. Repeating a change, or any sequence of changes, can never deduct twice.
 */

export type OrderStatus = OrderRequestStatus;

/** Every status in workflow order, with the word the admin shows. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "New",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as string[]).includes(value);
}

/** Orders still waiting on the client: counted in the admin bar and at the top of the list. */
export const ATTENTION_STATUSES: OrderStatus[] = ["NEW", "AWAITING_PAYMENT"];

/** Statuses in which an order's tracked stock is deducted. */
export const STOCK_DEDUCTED_STATUSES: OrderStatus[] = ["PAID", "SHIPPED"];

/** The usual next steps from each status, offered as buttons. Anything else is a correction. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["AWAITING_PAYMENT", "PAID", "CANCELLED"],
  AWAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: [],
  CANCELLED: [],
};

/** Button text for moving an order to each status. */
export const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  NEW: "Move back to New",
  AWAITING_PAYMENT: "Mark awaiting payment",
  PAID: "Mark paid",
  SHIPPED: "Mark shipped",
  CANCELLED: "Cancel order",
};

/** A mistaken status can be corrected to any other one. */
export function correctionTargets(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUSES.filter((status) => status !== current);
}

export type StockMove = "deduct" | "restore" | "none";

/**
 * What moving an order to `target` does to stock. Entering Paid or Shipped deducts unless
 * the stock is already deducted; entering New, Awaiting payment or Cancelled restores it
 * if it is. Decided by the flag, not by the previous status.
 */
export function stockMove(target: OrderStatus, stockAdjusted: boolean): StockMove {
  const deducted = STOCK_DEDUCTED_STATUSES.includes(target);
  if (deducted === stockAdjusted) {
    return "none";
  }
  return deducted ? "deduct" : "restore";
}

/** The flag after a move. */
export function stockAdjustedAfter(move: StockMove, stockAdjusted: boolean): boolean {
  return move === "none" ? stockAdjusted : move === "deduct";
}

/**
 * Timestamps a change sets. paidAt records when payment was recorded and shippedAt when the
 * order was marked shipped; neither is ever cleared. Moving a shipped order back to Paid is
 * a correction, not a new payment, so it keeps the paidAt already recorded.
 */
export function statusTimestamps(
  from: OrderStatus,
  target: OrderStatus,
  paidAt: Date | null,
  now: Date,
): { paidAt?: Date; shippedAt?: Date } {
  if (target === "PAID") {
    return from === "SHIPPED" && paidAt !== null ? {} : { paidAt: now };
  }
  if (target === "SHIPPED") {
    return { shippedAt: now };
  }
  return {};
}

/* -------------------------------------------------------------------------- */
/*  Describing a move before and after it happens                             */
/* -------------------------------------------------------------------------- */

/** One order line and the size it was ordered in (null once that size is deleted). */
export type StockItem = {
  name: string;
  quantity: number;
  variant: { trackInventory: boolean; stock: number | null } | null;
};

/** A tracked size whose stock a move changes. A tracked size with no count counts as 0. */
export type StockLine = { name: string; before: number; after: number };

export type StockPlan = {
  move: StockMove;
  lines: StockLine[];
  /** Sizes that do not track stock. */
  untracked: string[];
  /** Lines whose size is no longer in the catalogue. */
  deleted: string[];
};

export function planStock(items: StockItem[], move: StockMove): StockPlan {
  const plan: StockPlan = { move, lines: [], untracked: [], deleted: [] };
  for (const item of items) {
    if (item.variant === null) {
      plan.deleted.push(item.name);
    } else if (!item.variant.trackInventory) {
      plan.untracked.push(item.name);
    } else if (move !== "none") {
      const before = item.variant.stock ?? 0;
      const after = move === "deduct" ? before - item.quantity : before + item.quantity;
      plan.lines.push({ name: item.name, before, after });
    }
  }
  return plan;
}

function oversold(line: StockLine): string {
  return line.after < 0 ? ` (oversold by ${-line.after})` : "";
}

function join(names: string[]): string {
  return names.join(", ");
}

/**
 * Plain sentences for what a move does: "will" for the confirmation, "did" for the result.
 * Every line of the order is accounted for whenever stock moves.
 */
export function describeStock(plan: StockPlan, tense: "will" | "did"): string[] {
  const will = tense === "will";
  const unchanged = will ? "Stock does not change." : "Stock did not change.";
  if (plan.move === "none") {
    return [unchanged];
  }

  const sentences: string[] = [];
  if (plan.lines.length > 0) {
    const verb =
      plan.move === "deduct"
        ? will
          ? "Stock goes down"
          : "Stock went down"
        : will
          ? "Stock goes back up"
          : "Stock went back up";
    const changes = plan.lines.map(
      (line) => `${line.name} from ${line.before} to ${line.after}${oversold(line)}`,
    );
    sentences.push(`${verb}: ${changes.join("; ")}.`);
  } else {
    sentences.push(unchanged);
  }
  if (plan.untracked.length > 0) {
    sentences.push(`Not tracked, so unchanged: ${join(plan.untracked)}.`);
  }
  if (plan.deleted.length > 0) {
    sentences.push(`No longer in the catalogue, so unchanged: ${join(plan.deleted)}.`);
  }
  return sentences;
}

/** Why a change leaves stock alone, for the confirmation. */
export function whyNoStockMove(target: OrderStatus): string {
  return STOCK_DEDUCTED_STATUSES.includes(target)
    ? "It is already deducted for this order."
    : "Nothing is deducted for this order at the moment.";
}
