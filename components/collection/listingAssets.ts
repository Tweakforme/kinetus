import { PAGE_SIZE } from "@/lib/catalogue";
import { SITE_NAME } from "@/lib/site";

/** The client's keyed render used by every listing hero and the category cards. */
export const LISTING_RENDER = {
  src: "/products/kinetus-vial-and-blank-box-cut.png",
  alt: `${SITE_NAME} vial and box (product render)`,
};

/** Divider subheadings on catalogue pages (deck slide 12 reads "SCIENCE. PURITY. PERFORMANCE.", replaced by the permitted packaging string). */
export const CATALOGUE_SUBTITLE = "QUALITY YOU CAN TRUST";
export const CATALOGUE_NOTE = "Supporting research through clear scientific classification.";

/** Anchor of the catalogue section (divider, pills, grid) on every listing page. */
export const CATALOGUE_SECTION_ID = "catalogue";

/** "Showing 1–12 of 29 products", or "Showing 4 products" when one page holds everything. */
export function resultsLine(page: number, totalItems: number): string {
  if (totalItems <= PAGE_SIZE) {
    return `Showing ${totalItems} ${totalItems === 1 ? "product" : "products"}`;
  }
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalItems);
  return `Showing ${start}–${end} of ${totalItems} products`;
}

/** "Peptides" on page 1, "Peptides, page 2" after that. */
export function pagedTitle(title: string, page: number): string {
  return page > 1 ? `${title}, page ${page}` : title;
}
