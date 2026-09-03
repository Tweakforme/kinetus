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

/** Header utility-bar strings — verbatim from the client's packaging. Do not reword. */
export const UTILITY_BAR_LINES = ["RESEARCH USE ONLY", "NOT FOR HUMAN CONSUMPTION."] as const;

/** Hero eyebrow — verbatim from the client's packaging. Do not reword. */
export const TAGLINE = "PRECISION SCIENCE. PEAK POTENTIAL.";

export type NavLink = {
  label: string;
  href: string;
  /** `false` opts a link out of viewport prefetching. Every current route exists. */
  prefetch?: boolean;
};

/** A primary-nav entry; `children` makes it a dropdown (desktop) / accordion (drawer). */
export type NavItem = NavLink & {
  children?: NavLink[];
};

/** Minimal collection shape the nav builder needs (see lib/collections getNavCollections). */
export type NavCollectionInput = {
  slug: string;
  name: string;
  products: { slug: string; name: string }[];
};

/** Canonical full listing. */
export const ALL_PRODUCTS_LINK: NavLink = { label: "View all products", href: "/products" };

/** Hub of every published collection. */
export const ALL_COLLECTIONS_LINK: NavLink = { label: "All collections", href: "/collections" };

export const CONTACT_LINK: NavLink = { label: "Contact", href: "/contact" };

/**
 * Primary navigation, per the client-confirmed deck: each published collection is a
 * top-level dropdown listing its products and ending with "View all", then Contact.
 * View all products, About and FAQ live in the footer.
 */
export function buildPrimaryNav(collections: NavCollectionInput[]): NavItem[] {
  return [
    ...collections.map((collection) => ({
      label: collection.name,
      href: `/collections/${collection.slug}`,
      children: [
        ...collection.products.map((product) => ({
          label: product.name,
          href: `/products/${product.slug}`,
        })),
        { label: "View all", href: `/collections/${collection.slug}` },
      ],
    })),
    CONTACT_LINK,
  ];
}

/** Footer "Catalogue" column = All products, each published collection, All collections. */
export function buildCatalogueLinks(collectionLinks: NavLink[]): NavLink[] {
  return [{ label: "All products", href: "/products" }, ...collectionLinks, ALL_COLLECTIONS_LINK];
}

export const FOOTER_COMPANY_LINKS: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_POLICY_LINKS: NavLink[] = [
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy-policy" },
  { label: "Shipping policy", href: "/shipping-policy" },
  { label: "Returns & refund policy", href: "/returns-policy" },
  { label: "Research use disclaimer", href: "/research-use" },
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
