import { COLLECTION_SLUGS } from "@/lib/site";

/** Cards per listing page (the client's change list: 20 per page). */
export const PAGE_SIZE = 20;

export type PageSlice<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
};

/** Slices a list for a 1-based page; a page past the end returns an empty slice. */
export function paginate<T>(items: T[], page: number): PageSlice<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  return {
    items: items.slice(start, start + PAGE_SIZE),
    page,
    totalPages,
    totalItems: items.length,
  };
}

/** Number of listing pages for a product count. */
export function pageCount(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
}

/**
 * Parses an old `/page/[n]` route segment (now only redirected to `?page=n`); null when
 * it is not a whole number >= 2.
 */
export function parsePageParam(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const page = Number(value);
  return page >= 2 ? page : null;
}

/**
 * Parses `?page=` on a listing: absent is page 1; anything but a whole number >= 1 is
 * null (the route 404s). A page past the end is left to the listing to 404.
 */
export function parsePageQuery(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) {
    return 1;
  }
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  const page = Number(raw);
  return page >= 1 ? page : null;
}

/** `/base` for page 1, `/base?page=N` otherwise. */
export function pageHref(base: string, page: number): string {
  return page <= 1 ? base : `${base}?page=${page}`;
}

/**
 * Approved hero paragraph and button label per range (deck slides 12 and 17), used while
 * the collection's subtitle is empty. The headline is always the collection's name.
 */
export const COLLECTION_HERO: Record<string, { paragraph: string; ctaLabel: string }> = {
  [COLLECTION_SLUGS.peptides]: {
    paragraph:
      "Research-grade peptide materials supplied as lyophilized powder in sealed glass vials. Every unit is labelled with a batch reference, and batch-specific documentation is available.",
    ctaLabel: "View all peptides",
  },
  [COLLECTION_SLUGS.blends]: {
    paragraph:
      "Combination peptide materials supplied as lyophilized powder in a single sealed vial. Each blend is labelled with its components, its total strength and a batch reference.",
    ctaLabel: "View all blends",
  },
  [COLLECTION_SLUGS.labSupplies]: {
    paragraph:
      "Laboratory consumables that accompany the catalogue. Bacteriostatic water is listed now; further supplies are added as the client confirms them.",
    ctaLabel: "View all lab supplies",
  },
  [COLLECTION_SLUGS.research]: {
    paragraph:
      "Documentation for the catalogue: how units are identified, what a batch reference is, and how batch-specific certificates of analysis are requested.",
    ctaLabel: "Request documentation",
  },
};

/** Fallback hero copy for any collection the map does not know. */
export const DEFAULT_COLLECTION_HERO = {
  paragraph:
    "Research materials supplied with a batch reference on every unit. Batch-specific documentation is available on request.",
  ctaLabel: "View all products",
};
