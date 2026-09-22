"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { VariantView } from "@/lib/products";

/**
 * A variant as the client sees it. Prices are formatted on the server so the browser
 * ships no pricing or database code; the client components only read labels.
 */
export type SelectableVariant = VariantView & {
  /** Formatted effective price, e.g. "$45.00". */
  priceLabel: string;
  /** Formatted original price while a sale is active, otherwise null. */
  compareAtLabel: string | null;
};

type ProductSelectionValue = {
  variants: SelectableVariant[];
  /** The selected variant, or null when the product has no active variants. */
  selected: SelectableVariant | null;
  select: (id: string) => void;
};

const ProductSelectionContext = createContext<ProductSelectionValue | null>(null);

type ProductSelectionProviderProps = {
  variants: SelectableVariant[];
  children: ReactNode;
};

/**
 * Owns the selected-variant state for the product hero. The size line in the copy
 * column and the price in the panel both read it, while the heading, copy and render
 * passed in as children stay server-rendered. The first active variant is selected by
 * default.
 */
export function ProductSelectionProvider({ variants, children }: ProductSelectionProviderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(variants[0]?.id ?? null);
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0] ?? null;

  const value = useMemo<ProductSelectionValue>(
    () => ({ variants, selected, select: setSelectedId }),
    [variants, selected],
  );

  return (
    <ProductSelectionContext.Provider value={value}>{children}</ProductSelectionContext.Provider>
  );
}

export function useProductSelection(): ProductSelectionValue {
  const value = useContext(ProductSelectionContext);
  if (!value) {
    throw new Error("useProductSelection must be used inside ProductSelectionProvider.");
  }
  return value;
}
