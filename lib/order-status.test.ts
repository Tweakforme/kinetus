import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  correctionTargets,
  describeStock,
  isOrderStatus,
  NEXT_STATUSES,
  ORDER_STATUSES,
  planStock,
  statusTimestamps,
  stockAdjustedAfter,
  stockMove,
  type OrderStatus,
  type StockItem,
} from "./order-status.ts";

/** One tracked line: applies a sequence of changes the way lib/admin/orders.ts does. */
function simulate(sequence: OrderStatus[], start = 10, quantity = 2) {
  let status: OrderStatus = "NEW";
  let stockAdjusted = false;
  let stock = start;
  const history: number[] = [];
  for (const target of sequence) {
    if (target === status) {
      continue;
    }
    const move = stockMove(target, stockAdjusted);
    const plan = planStock(
      [{ name: "Line", quantity, variant: { trackInventory: true, stock } }],
      move,
    );
    stock = plan.lines[0]?.after ?? stock;
    stockAdjusted = stockAdjustedAfter(move, stockAdjusted);
    status = target;
    history.push(stock);
  }
  return { status, stockAdjusted, stock, history };
}

describe("stockMove", () => {
  it("deducts on entering Paid or Shipped, once", () => {
    assert.equal(stockMove("PAID", false), "deduct");
    assert.equal(stockMove("SHIPPED", false), "deduct");
    assert.equal(stockMove("PAID", true), "none");
    assert.equal(stockMove("SHIPPED", true), "none");
  });

  it("restores on entering New, Awaiting payment or Cancelled, only if deducted", () => {
    for (const target of ["NEW", "AWAITING_PAYMENT", "CANCELLED"] as const) {
      assert.equal(stockMove(target, true), "restore");
      assert.equal(stockMove(target, false), "none");
    }
  });
});

describe("the section 13.5 sequence", () => {
  it("paid, paid again, cancel, paid again: one decrement at the end", () => {
    let order = { status: "NEW" as OrderStatus, stockAdjusted: false, stock: 10 };
    const step = (target: OrderStatus) => {
      const move = stockMove(target, order.stockAdjusted);
      const plan = planStock(
        [{ name: "Line", quantity: 2, variant: { trackInventory: true, stock: order.stock } }],
        move,
      );
      order = {
        status: target,
        stockAdjusted: stockAdjustedAfter(move, order.stockAdjusted),
        stock: plan.lines[0]?.after ?? order.stock,
      };
      return order.stock;
    };
    assert.equal(step("PAID"), 8);
    assert.equal(step("PAID"), 8, "marking paid again must not deduct again");
    assert.equal(step("CANCELLED"), 10);
    assert.equal(step("PAID"), 8);
    assert.equal(order.stockAdjusted, true);
  });

  it("moving back from Paid or Shipped restores; Shipped after Paid does not deduct again", () => {
    assert.deepEqual(simulate(["PAID", "AWAITING_PAYMENT"]).history, [8, 10]);
    assert.deepEqual(simulate(["PAID", "NEW"]).history, [8, 10]);
    assert.deepEqual(simulate(["PAID", "SHIPPED", "PAID", "SHIPPED"]).history, [8, 8, 8, 8]);
    assert.deepEqual(simulate(["PAID", "SHIPPED", "NEW"]).history, [8, 8, 10]);
    assert.deepEqual(simulate(["AWAITING_PAYMENT", "SHIPPED", "CANCELLED"]).history, [10, 8, 10]);
    assert.deepEqual(simulate(["CANCELLED", "NEW", "CANCELLED"]).history, [10, 10, 10]);
  });

  it("every sequence of up to five changes leaves stock deducted exactly when Paid or Shipped", () => {
    const sequences: OrderStatus[][] = [[]];
    for (let length = 0; length < 5; length += 1) {
      for (const sequence of [...sequences]) {
        if (sequence.length === length) {
          for (const status of ORDER_STATUSES) {
            sequences.push([...sequence, status]);
          }
        }
      }
    }
    assert.equal(sequences.length, 1 + 5 + 25 + 125 + 625 + 3125);
    for (const sequence of sequences) {
      const result = simulate(sequence);
      const deducted = result.status === "PAID" || result.status === "SHIPPED";
      assert.equal(result.stock, deducted ? 8 : 10, sequence.join(" > "));
      assert.equal(result.stockAdjusted, deducted, sequence.join(" > "));
    }
  });
});

describe("statusTimestamps", () => {
  const now = new Date("2026-09-23T18:00:00Z");
  const earlier = new Date("2026-09-20T18:00:00Z");

  it("records paidAt on entering Paid and shippedAt on entering Shipped", () => {
    assert.deepEqual(statusTimestamps("NEW", "PAID", null, now), { paidAt: now });
    assert.deepEqual(statusTimestamps("AWAITING_PAYMENT", "PAID", null, now), { paidAt: now });
    assert.deepEqual(statusTimestamps("CANCELLED", "PAID", earlier, now), { paidAt: now });
    assert.deepEqual(statusTimestamps("PAID", "SHIPPED", earlier, now), { shippedAt: now });
  });

  it("keeps the recorded payment date when a shipped order is moved back to Paid", () => {
    assert.deepEqual(statusTimestamps("SHIPPED", "PAID", earlier, now), {});
    assert.deepEqual(statusTimestamps("SHIPPED", "PAID", null, now), { paidAt: now });
  });

  it("never clears a timestamp", () => {
    for (const target of ["NEW", "AWAITING_PAYMENT", "CANCELLED"] as const) {
      assert.deepEqual(statusTimestamps("SHIPPED", target, earlier, now), {});
    }
  });
});

describe("planStock and describeStock", () => {
  const items: StockItem[] = [
    { name: "GHK-Cu 100 mg", quantity: 2, variant: { trackInventory: true, stock: 1 } },
    { name: "BPC-157 10 mg", quantity: 1, variant: { trackInventory: true, stock: null } },
    {
      name: "Bacteriostatic Water 30 ml",
      quantity: 3,
      variant: { trackInventory: false, stock: 5 },
    },
    { name: "Retired 5 mg", quantity: 1, variant: null },
  ];

  it("lets stock go negative and counts a missing count as 0", () => {
    const plan = planStock(items, "deduct");
    assert.deepEqual(plan.lines, [
      { name: "GHK-Cu 100 mg", before: 1, after: -1 },
      { name: "BPC-157 10 mg", before: 0, after: -1 },
    ]);
    assert.deepEqual(plan.untracked, ["Bacteriostatic Water 30 ml"]);
    assert.deepEqual(plan.deleted, ["Retired 5 mg"]);
  });

  it("describes every line, flags overselling, and changes tense", () => {
    assert.deepEqual(describeStock(planStock(items, "deduct"), "will"), [
      "Stock goes down: GHK-Cu 100 mg from 1 to -1 (oversold by 1); BPC-157 10 mg from 0 to -1 (oversold by 1).",
      "Not tracked, so unchanged: Bacteriostatic Water 30 ml.",
      "No longer in the catalogue, so unchanged: Retired 5 mg.",
    ]);
    assert.deepEqual(describeStock(planStock(items, "restore"), "did"), [
      "Stock went back up: GHK-Cu 100 mg from 1 to 3; BPC-157 10 mg from 0 to 1.",
      "Not tracked, so unchanged: Bacteriostatic Water 30 ml.",
      "No longer in the catalogue, so unchanged: Retired 5 mg.",
    ]);
    assert.deepEqual(describeStock(planStock(items, "none"), "will"), ["Stock does not change."]);
    assert.deepEqual(describeStock(planStock([items[2]], "deduct"), "will"), [
      "Stock does not change.",
      "Not tracked, so unchanged: Bacteriostatic Water 30 ml.",
    ]);
  });
});

describe("status helpers", () => {
  it("accepts only real statuses", () => {
    assert.equal(isOrderStatus("PAID"), true);
    for (const value of ["paid", "", "toString", "constructor", null, 3]) {
      assert.equal(isOrderStatus(value), false, String(value));
    }
  });

  it("offers every other status as a correction and only real next steps", () => {
    for (const status of ORDER_STATUSES) {
      assert.deepEqual(
        correctionTargets(status),
        ORDER_STATUSES.filter((other) => other !== status),
      );
      for (const next of NEXT_STATUSES[status]) {
        assert.notEqual(next, status);
      }
    }
  });
});
