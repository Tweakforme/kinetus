/**
 * Listing sort orders for `?sort=` on /products and /collections/[slug]. Pure, so
 * node:test runs it directly (lib/sort.test.ts).
 */

export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/** A known sort from `?sort=`, or null (the catalogue order) for anything else. */
export function parseSort(raw: string | string[] | undefined): SortKey | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? null;
}

/** Appends `?sort=` to a listing href; no parameter for the catalogue order. */
export function withSort(href: string, sort: SortKey | null): string {
  return sort ? `${href}?sort=${sort}` : href;
}

type Sortable = { name: string; lowestPriceCents: number | null };

const byName = (a: Sortable, b: Sortable) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base", numeric: true });

/**
 * Sorts a listing before it is paginated. Price uses each product's lowest active price
 * (sale price while a sale runs); products without a price go last; ties fall back to
 * the name. Null keeps the catalogue order as given.
 */
export function sortListing<T extends Sortable>(items: T[], sort: SortKey | null): T[] {
  if (!sort) {
    return items;
  }
  const sorted = [...items];
  const price = (item: T) => item.lowestPriceCents ?? Number.POSITIVE_INFINITY;
  switch (sort) {
    case "name-asc":
      return sorted.sort(byName);
    case "name-desc":
      return sorted.sort((a, b) => byName(b, a));
    case "price-asc":
      return sorted.sort((a, b) => price(a) - price(b) || byName(a, b));
    case "price-desc":
      return sorted.sort((a, b) => {
        if (a.lowestPriceCents === null || b.lowestPriceCents === null) {
          return price(a) - price(b);
        }
        return b.lowestPriceCents - a.lowestPriceCents || byName(a, b);
      });
  }
}
