import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bpsOfCents,
  discountCodeProblem,
  isSaleActive,
  percentOfCents,
  priceCart,
  tierPreview,
  type DiscountCodeFields,
  type PriceCartInput,
} from "./pricing.ts";

// Run with `npm test` (node --experimental-strip-types --test).

const TIERS = [
  { minQuantity: 2, percentOff: 5, isActive: true },
  { minQuantity: 3, percentOff: 10, isActive: true },
];

const SETTINGS = {
  taxEnabled: false,
  shippingFlatCents: 2000,
  freeShippingThresholdCents: 19900,
  localFreeCity: "Calgary",
};

const TAX_RATES = [
  { province: "ON", label: "Ontario (HST)", rateBps: 1300, isActive: true },
  { province: "AB", label: "Alberta (GST)", rateBps: 500, isActive: true },
];

const TORONTO = { city: "Toronto", province: "ON" };

function input(overrides: Partial<PriceCartInput>): PriceCartInput {
  return {
    lines: [],
    tiers: TIERS,
    code: null,
    settings: SETTINGS,
    taxRates: TAX_RATES,
    destination: TORONTO,
    ...overrides,
  };
}

describe("priceCart", () => {
  it("no discount: one unit, flat shipping", () => {
    const summary = priceCart(input({ lines: [{ unitPriceCents: 4500, quantity: 1 }] }));
    assert.equal(summary.subtotalCents, 4500);
    assert.equal(summary.volumeDiscountCents, 0);
    assert.equal(summary.codeDiscountCents, 0);
    assert.equal(summary.shippingCents, 2000);
    assert.equal(summary.shippingReason, "flat");
    assert.equal(summary.taxCents, 0);
    assert.equal(summary.totalCents, 6500);
  });

  it("volume only: tiers count quantity across the whole cart and the highest tier wins", () => {
    const two = priceCart(input({ lines: [{ unitPriceCents: 4500, quantity: 2 }] }));
    assert.equal(two.volumeDiscountCents, 450);
    assert.deepEqual(two.volumeTier, { minQuantity: 2, percentOff: 5 });
    assert.equal(two.totalCents, 9000 - 450 + 2000);

    const mixed = priceCart(
      input({
        lines: [
          { unitPriceCents: 4500, quantity: 1 },
          { unitPriceCents: 3333, quantity: 2 },
        ],
      }),
    );
    // 4500 + 6666 = 11166; 10% = 1116.6, rounded half up to 1117.
    assert.equal(mixed.subtotalCents, 11166);
    assert.equal(mixed.volumeDiscountCents, 1117);
    assert.deepEqual(mixed.volumeTier, { minQuantity: 3, percentOff: 10 });
  });

  it("code only: percentage off the subtotal", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 1 }],
        code: { code: "SAVE15", percentOff: 15 },
      }),
    );
    assert.equal(summary.codeDiscountCents, 675);
    assert.deepEqual(summary.appliedCode, { code: "SAVE15", percentOff: 15 });
    assert.equal(summary.volumeDiscountCents, 0);
    assert.equal(summary.totalCents, 4500 - 675 + 2000);
  });

  it("code with a volume tier reached: the code replaces the volume discount, even when smaller", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 3 }],
        code: { code: "SAVE5", percentOff: 5 },
      }),
    );
    assert.equal(summary.codeDiscountCents, 675);
    assert.deepEqual(summary.appliedCode, { code: "SAVE5", percentOff: 5 });
    assert.equal(summary.volumeDiscountCents, 0);
    assert.equal(summary.volumeTier, null);
    assert.equal(summary.volumeReplacedByCode, true);
    assert.equal(summary.discountedSubtotalCents, 13500 - 675);
  });

  it("code larger than the tier: the code applies and the volume discount is zero", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 2 }],
        code: { code: "SAVE20", percentOff: 20 },
      }),
    );
    assert.equal(summary.codeDiscountCents, 1800);
    assert.equal(summary.volumeDiscountCents, 0);
    assert.equal(summary.volumeTier, null);
  });

  it("no code: the volume discount applies and nothing is replaced", () => {
    const summary = priceCart(input({ lines: [{ unitPriceCents: 4500, quantity: 2 }] }));
    assert.equal(summary.volumeDiscountCents, 450);
    assert.equal(summary.volumeReplacedByCode, false);
  });

  it("code below any tier: nothing is replaced", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 1 }],
        code: { code: "SAVE5", percentOff: 5 },
      }),
    );
    assert.equal(summary.codeDiscountCents, 225);
    assert.equal(summary.volumeReplacedByCode, false);
  });

  it("free shipping threshold: applies to the discounted subtotal, at the threshold exactly", () => {
    const at = priceCart(input({ lines: [{ unitPriceCents: 19900, quantity: 1 }] }));
    assert.equal(at.shippingCents, 0);
    assert.equal(at.shippingReason, "threshold");

    const below = priceCart(input({ lines: [{ unitPriceCents: 19899, quantity: 1 }] }));
    assert.equal(below.shippingCents, 2000);

    // 2 × 10400 = 20800 before discount, 19760 after 5%: below the threshold.
    const discountedBelow = priceCart(input({ lines: [{ unitPriceCents: 10400, quantity: 2 }] }));
    assert.equal(discountedBelow.discountedSubtotalCents, 19760);
    assert.equal(discountedBelow.shippingCents, 2000);
  });

  it("Calgary free delivery: city case-insensitively, province must be AB", () => {
    const lines = [{ unitPriceCents: 4500, quantity: 1 }];
    const calgary = priceCart(
      input({ lines, destination: { city: "  cALGARY ", province: "AB" } }),
    );
    assert.equal(calgary.shippingCents, 0);
    assert.equal(calgary.shippingReason, "local");

    const wrongProvince = priceCart(
      input({ lines, destination: { city: "Calgary", province: "ON" } }),
    );
    assert.equal(wrongProvince.shippingCents, 2000);

    const unknown = priceCart(input({ lines, destination: null }));
    assert.equal(unknown.shippingCents, 2000);
  });

  it("tax off: no tax whatever the province", () => {
    const summary = priceCart(input({ lines: [{ unitPriceCents: 4500, quantity: 1 }] }));
    assert.equal(summary.taxEnabled, false);
    assert.equal(summary.taxCents, 0);
    assert.equal(summary.taxRateBps, 0);
    assert.equal(summary.taxLabel, null);
  });

  it("tax on: province rate on discounted subtotal plus shipping, recorded with its label", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 2 }],
        settings: { ...SETTINGS, taxEnabled: true },
      }),
    );
    // (9000 - 450 + 2000) × 13% = 1371.5, rounded half up to 1372.
    assert.equal(summary.taxCents, 1372);
    assert.equal(summary.taxRateBps, 1300);
    assert.equal(summary.taxLabel, "Ontario (HST)");
    assert.equal(summary.totalCents, 8550 + 2000 + 1372);

    const noAddress = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 1 }],
        settings: { ...SETTINGS, taxEnabled: true },
        destination: null,
      }),
    );
    assert.equal(noAddress.taxCents, null);
  });

  it("empty cart: everything zero, no shipping", () => {
    const summary = priceCart(input({ lines: [] }));
    assert.equal(summary.totalCents, 0);
    assert.equal(summary.shippingCents, 0);
  });

  it("never below zero: a 100% code leaves shipping only", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 1 }],
        code: { code: "ALL", percentOff: 150 },
      }),
    );
    assert.equal(summary.codeDiscountCents, 4500);
    assert.equal(summary.discountedSubtotalCents, 0);
    assert.equal(summary.totalCents, 2000);
  });

  it("ignores inactive tiers", () => {
    const summary = priceCart(
      input({
        lines: [{ unitPriceCents: 4500, quantity: 3 }],
        tiers: [{ minQuantity: 3, percentOff: 10, isActive: false }, TIERS[0]],
      }),
    );
    assert.equal(summary.volumeDiscountCents, 675);
  });
});

describe("rounding", () => {
  it("rounds half up once", () => {
    assert.equal(percentOfCents(1, 50), 1);
    assert.equal(percentOfCents(3, 50), 2);
    assert.equal(percentOfCents(4, 10), 0);
    assert.equal(bpsOfCents(10_050, 1300), 1307);
  });
});

describe("tierPreview", () => {
  it("matches the mockup line: Buy 2, save 5%, $85.50 ($42.75 each)", () => {
    assert.deepEqual(tierPreview(4500, TIERS[0]), { totalCents: 8550, eachCents: 4275 });
    assert.deepEqual(tierPreview(4500, TIERS[1]), { totalCents: 12150, eachCents: 4050 });
  });
});

describe("discountCodeProblem", () => {
  const now = new Date("2026-09-22T12:00:00Z");
  const base: DiscountCodeFields = {
    code: "KIN10",
    percentOff: 10,
    isActive: true,
    startsAt: null,
    endsAt: null,
    maxRedemptions: null,
    timesRedeemed: 0,
  };

  it("reports each failure mode", () => {
    assert.equal(discountCodeProblem(null, now), "not_found");
    assert.equal(discountCodeProblem({ ...base, isActive: false }, now), "inactive");
    assert.equal(
      discountCodeProblem({ ...base, startsAt: new Date("2026-10-01T00:00:00Z") }, now),
      "not_started",
    );
    assert.equal(
      discountCodeProblem({ ...base, endsAt: new Date("2026-09-01T00:00:00Z") }, now),
      "expired",
    );
    assert.equal(
      discountCodeProblem({ ...base, maxRedemptions: 5, timesRedeemed: 5 }, now),
      "limit_reached",
    );
    assert.equal(discountCodeProblem({ ...base, maxRedemptions: 5, timesRedeemed: 4 }, now), null);
  });
});

describe("isSaleActive", () => {
  const now = new Date("2026-09-22T12:00:00Z");
  it("honours the window", () => {
    const sale = { price: 5000, salePrice: 4000, saleStartsAt: null, saleEndsAt: null };
    assert.equal(isSaleActive(sale, now), true);
    assert.equal(
      isSaleActive({ ...sale, saleEndsAt: new Date("2026-09-21T00:00:00Z") }, now),
      false,
    );
    assert.equal(
      isSaleActive({ ...sale, saleStartsAt: new Date("2026-09-23T00:00:00Z") }, now),
      false,
    );
    assert.equal(isSaleActive({ ...sale, salePrice: 6000 }, now), false);
  });
});
