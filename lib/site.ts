/**
 * Site-wide constants shared by the layout shell and SEO routes.
 * Only confirmed client facts belong here — no fabricated data.
 */

export const SITE_NAME = "Kinetus BioLabs";

/**
 * Research-use disclaimer. Exact copy sourced from the client's packaging and the
 * "Kinetus RESEARCH USE - PRODUCT DISCLAIMER" document. Do not paraphrase.
 *
 * Kept as its two sentences so narrow layouts can wrap at the sentence boundary;
 * RESEARCH_USE_COPY is the joined, exact approved wording.
 */
export const RESEARCH_USE_COPY_LINES = [
  "For Research Use Only.",
  "Not for Human or Animal Use.",
] as const;

export const RESEARCH_USE_COPY = RESEARCH_USE_COPY_LINES.join(" ");

export type NavLink = {
  label: string;
  href: string;
  /**
   * `false` for routes that do not exist yet (Phase 6): viewport prefetching would log
   * 404s on every page load. Remove once the route is built.
   */
  prefetch?: boolean;
};

/** Canonical full listing, shown after the collection links in the catalogue nav. */
export const ALL_PRODUCTS_LINK: NavLink = { label: "View all products", href: "/products" };

/** Hub of every published collection. */
export const ALL_COLLECTIONS_LINK: NavLink = { label: "All collections", href: "/collections" };

/** Contact route is built in Phase 6 and will 404 until then. */
export const CONTACT_LINK: NavLink = { label: "Contact", href: "/contact", prefetch: false };

/**
 * Primary navigation = published collections (database-driven, display order) as
 * top-level items per the client-confirmed deck, then Contact. "View all products",
 * About and FAQ live in the footer (Phase 4.5 craft pass) so the nav fits one line.
 */
export function buildPrimaryNav(collectionLinks: NavLink[]): NavLink[] {
  return [...collectionLinks, CONTACT_LINK];
}

/** Footer "Catalogue" column = All products, each published collection, All collections. */
export function buildCatalogueLinks(collectionLinks: NavLink[]): NavLink[] {
  return [{ label: "All products", href: "/products" }, ...collectionLinks, ALL_COLLECTIONS_LINK];
}

export const FOOTER_COMPANY_LINKS: NavLink[] = [
  { label: "About", href: "/about", prefetch: false },
  { label: "FAQ", href: "/faq", prefetch: false },
  { label: "Contact", href: "/contact", prefetch: false },
];

export const FOOTER_POLICY_LINKS: NavLink[] = [
  { label: "Terms & conditions", href: "/terms", prefetch: false },
  { label: "Privacy policy", href: "/privacy-policy", prefetch: false },
  { label: "Shipping policy", href: "/shipping-policy", prefetch: false },
  { label: "Returns & refund policy", href: "/returns-policy", prefetch: false },
  { label: "Research use disclaimer", href: "/research-use", prefetch: false },
];

/** Static top-level routes listed in the sitemap. */
export const STATIC_ROUTES: string[] = [
  "/",
  "/products",
  "/collections",
  "/about",
  "/faq",
  "/contact",
  "/terms",
  "/privacy-policy",
  "/shipping-policy",
  "/returns-policy",
  "/research-use",
];
