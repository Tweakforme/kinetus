/**
 * Site-wide constants shared by the layout shell and SEO routes.
 * Only confirmed client facts belong here — no fabricated data.
 */

export const SITE_NAME = "Kinetus BioLabs";

/**
 * Research-use disclaimer. Exact copy sourced from the client's packaging and the
 * "Kinetus RESEARCH USE - PRODUCT DISCLAIMER" document. Do not paraphrase.
 */
export const RESEARCH_USE_COPY = "For Research Use Only. Not for Human or Animal Use.";

export type NavLink = {
  label: string;
  href: string;
};

/**
 * Primary navigation. These routes are built in later phases and will 404 until then.
 * Order follows the approved "Mobile Navigation — Open State" frame.
 */
export const PRIMARY_NAV: NavLink[] = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_COMPANY_LINKS: NavLink[] = [
  { label: "Products", href: "/products" },
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
