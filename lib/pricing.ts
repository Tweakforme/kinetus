/**
 * Order pricing: the one place totals are calculated. The cart page, the checkout page and
 * the order submission all call priceCart with lines resolved from the database, so a
 * total shown to a customer and the total stored on their order always come from the
 * same rules. Pure and dependency-free (no Prisma, no Next) so node:test can run it
 * directly (lib/pricing.test.ts).
 *
 * All amounts are integer cents; percentages are whole numbers (5 = 5%); tax rates are
 * basis points (1300 = 13%). Each discount step rounds half up once, at its end.
 */

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});

/** Formats integer cents as a CAD amount, e.g. 38900 → "$389.00". */
export function formatCad(cents: number): string {
  return cadFormatter.format(cents / 100);
}

/* -------------------------------------------------------------------------- */
/*  Sale prices                                                               */
/* -------------------------------------------------------------------------- */

export type SaleFields = {
  price: number;
  salePrice: number | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
};

/**
 * A sale is active only when a lower sale price exists and `now` falls inside the
 * optional start/end window.
 */
export function isSaleActive(variant: SaleFields, now: Date): boolean {
  if (variant.salePrice === null || variant.salePrice >= variant.price) {
    return false;
  }
  if (variant.saleStartsAt && now < variant.saleStartsAt) {
    return false;
  }
  if (variant.saleEndsAt && now > variant.saleEndsAt) {
    return false;
  }
  return true;
}

export function effectivePriceCents(variant: SaleFields, now: Date): number {
  return isSaleActive(variant, now) && variant.salePrice !== null
    ? variant.salePrice
    : variant.price;
}

/* -------------------------------------------------------------------------- */
/*  Rounding                                                                  */
/* -------------------------------------------------------------------------- */

/** `amount × numerator / denominator`, rounded half up. Integers in, integer out. */
function fractionHalfUp(amount: number, numerator: number, denominator: number): number {
  return Math.floor((amount * numerator * 2 + denominator) / (denominator * 2));
}

/** Percentage of an amount in cents, rounded half up. */
export function percentOfCents(amountCents: number, percent: number): number {
  return fractionHalfUp(amountCents, percent, 100);
}

/** Basis points of an amount in cents, rounded half up. */
export function bpsOfCents(amountCents: number, bps: number): number {
  return fractionHalfUp(amountCents, bps, 10_000);
}

/* -------------------------------------------------------------------------- */
/*  Discount codes                                                            */
/* -------------------------------------------------------------------------- */

export type DiscountCodeFields = {
  code: string;
  percentOff: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  stacksWithVolume: boolean;
};

export type DiscountCodeProblem =
  "not_found" | "inactive" | "not_started" | "expired" | "limit_reached";

export const DISCOUNT_CODE_MESSAGES: Record<DiscountCodeProblem, string> = {
  not_found: "That code was not found. Check the spelling and try again.",
  inactive: "That code is not active.",
  not_started: "That code is not valid yet.",
  expired: "That code has expired.",
  limit_reached: "That code has reached its redemption limit.",
};

/** Why a code cannot be used right now, or null when it can. */
export function discountCodeProblem(
  code: DiscountCodeFields | null,
  now: Date,
): DiscountCodeProblem | null {
  if (!code) {
    return "not_found";
  }
  if (!code.isActive) {
    return "inactive";
  }
  if (code.startsAt && now < code.startsAt) {
    return "not_started";
  }
  if (code.endsAt && now > code.endsAt) {
    return "expired";
  }
  if (code.maxRedemptions !== null && code.timesRedeemed >= code.maxRedemptions) {
    return "limit_reached";
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Cart pricing                                                              */
/* -------------------------------------------------------------------------- */

export type PricingLine = {
  /** Effective unit price (sale price where active), resolved from the database. */
  unitPriceCents: number;
  quantity: number;
};

export type VolumeTier = { minQuantity: number; percentOff: number; isActive: boolean };

/** A code that has already passed discountCodeProblem. */
export type AppliedCode = { code: string; percentOff: number; stacksWithVolume: boolean };

export type PricingSettings = {
  taxEnabled: boolean;
  shippingFlatCents: number;
  freeShippingThresholdCents: number;
  localFreeCity: string | null;
};

export type TaxRateFields = { province: string; label: string; rateBps: number; isActive: boolean };

/** Where the order ships. Null on the cart page, before an address is known. */
export type Destination = { city: string; province: string } | null;

/** The one province the local free delivery city is in. */
export const LOCAL_FREE_PROVINCE = "AB";

export type PriceCartInput = {
  lines: PricingLine[];
  tiers: VolumeTier[];
  code: AppliedCode | null;
  settings: PricingSettings;
  taxRates: TaxRateFields[];
  destination: Destination;
};

export type ShippingReason = "flat" | "threshold" | "local";

export type PriceSummary = {
  itemCount: number;
  subtotalCents: number;
  /** The tier that applied, or null. */
  volumeTier: { minQuantity: number; percentOff: number } | null;
  volumeDiscountCents: number;
  /** The code that applied, or null (including when a larger volume discount won). */
  appliedCode: { code: string; percentOff: number } | null;
  codeDiscountCents: number;
  /** True when a valid code was entered but the volume discount was larger or equal. */
  codeOutweighed: boolean;
  discountedSubtotalCents: number;
  shippingCents: number;
  shippingReason: ShippingReason;
  /** Whether tax is charged at all (StoreSetting.taxEnabled). */
  taxEnabled: boolean;
  /** Null when tax is enabled but the province is not known yet. */
  taxCents: number | null;
  taxRateBps: number;
  taxLabel: string | null;
  totalCents: number;
};

/** The highest-minimum active tier the quantity reaches, or null. */
export function volumeTierFor(tiers: VolumeTier[], quantity: number): VolumeTier | null {
  let best: VolumeTier | null = null;
  for (const tier of tiers) {
    if (!tier.isActive || tier.minQuantity < 1 || quantity < tier.minQuantity) {
      continue;
    }
    if (!best || tier.minQuantity > best.minQuantity) {
      best = tier;
    }
  }
  return best;
}

/** True when the destination is the local free delivery city (city and province). */
export function isLocalFreeDelivery(
  localFreeCity: string | null,
  destination: Destination,
): boolean {
  if (!localFreeCity || !destination) {
    return false;
  }
  const normalise = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  return (
    normalise(destination.city) === normalise(localFreeCity) &&
    destination.province.trim().toUpperCase() === LOCAL_FREE_PROVINCE
  );
}

/**
 * Prices a cart. Order of operations:
 *  1. subtotal: sum of unit price × quantity
 *  2. volume discount: the highest active tier reached by the total quantity, off the subtotal
 *  3. code discount: the code's percentage off the subtotal
 *  4. the two never combine: the larger applies and the other is zero (volume on a tie).
 *     A code with stacksWithVolume takes its percentage off what remains after the volume
 *     discount instead, and both apply.
 *  5. shipping: flat, or free once the discounted subtotal reaches the threshold, or free
 *     to the local city in Alberta
 *  6. tax, only when enabled: the destination province's rate on discounted subtotal plus
 *     shipping
 *  7. total: discounted subtotal + shipping + tax, never below zero
 */
export function priceCart(input: PriceCartInput): PriceSummary {
  const { lines, tiers, code, settings, taxRates, destination } = input;

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);

  const tier = volumeTierFor(tiers, itemCount);
  const volumeCandidate = tier
    ? Math.min(subtotalCents, percentOfCents(subtotalCents, tier.percentOff))
    : 0;

  let volumeDiscountCents = 0;
  let codeDiscountCents = 0;
  let codeOutweighed = false;

  if (code && code.stacksWithVolume) {
    volumeDiscountCents = volumeCandidate;
    const remainder = subtotalCents - volumeDiscountCents;
    codeDiscountCents = Math.min(remainder, percentOfCents(remainder, code.percentOff));
  } else {
    const codeCandidate = code
      ? Math.min(subtotalCents, percentOfCents(subtotalCents, code.percentOff))
      : 0;
    if (codeCandidate > volumeCandidate) {
      codeDiscountCents = codeCandidate;
    } else {
      volumeDiscountCents = volumeCandidate;
      codeOutweighed = code !== null;
    }
  }

  const discountedSubtotalCents = Math.max(
    0,
    subtotalCents - volumeDiscountCents - codeDiscountCents,
  );

  let shippingCents = 0;
  let shippingReason: ShippingReason = "flat";
  if (itemCount > 0) {
    if (isLocalFreeDelivery(settings.localFreeCity, destination)) {
      shippingReason = "local";
    } else if (discountedSubtotalCents >= settings.freeShippingThresholdCents) {
      shippingReason = "threshold";
    } else {
      shippingCents = settings.shippingFlatCents;
    }
  }

  let taxCents: number | null = 0;
  let taxRateBps = 0;
  let taxLabel: string | null = null;
  if (settings.taxEnabled) {
    if (!destination) {
      taxCents = null;
    } else {
      const province = destination.province.trim().toUpperCase();
      const rate = taxRates.find(
        (candidate) => candidate.province === province && candidate.isActive,
      );
      if (rate) {
        taxRateBps = rate.rateBps;
        taxLabel = rate.label;
        taxCents = bpsOfCents(discountedSubtotalCents + shippingCents, rate.rateBps);
      }
    }
  }

  const totalCents = Math.max(0, discountedSubtotalCents + shippingCents + (taxCents ?? 0));

  return {
    itemCount,
    subtotalCents,
    volumeTier:
      volumeDiscountCents > 0 && tier
        ? { minQuantity: tier.minQuantity, percentOff: tier.percentOff }
        : null,
    volumeDiscountCents,
    appliedCode:
      code && codeDiscountCents > 0 ? { code: code.code, percentOff: code.percentOff } : null,
    codeDiscountCents,
    codeOutweighed,
    discountedSubtotalCents,
    shippingCents,
    shippingReason,
    taxEnabled: settings.taxEnabled,
    taxCents,
    taxRateBps,
    taxLabel,
    totalCents,
  };
}

/**
 * The product page's tier line: what `quantity` units at `unitPriceCents` come to after
 * the tier, priced by priceCart so the preview matches the cart exactly.
 */
export function tierPreview(
  unitPriceCents: number,
  tier: VolumeTier,
): { totalCents: number; eachCents: number } {
  const summary = priceCart({
    lines: [{ unitPriceCents, quantity: tier.minQuantity }],
    tiers: [tier],
    code: null,
    settings: {
      taxEnabled: false,
      shippingFlatCents: 0,
      freeShippingThresholdCents: 0,
      localFreeCity: null,
    },
    taxRates: [],
    destination: null,
  });
  return {
    totalCents: summary.discountedSubtotalCents,
    eachCents: fractionHalfUp(summary.discountedSubtotalCents, 1, tier.minQuantity),
  };
}
