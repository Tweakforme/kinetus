import { getNavCollections, type NavCollection } from "@/lib/collections";
import {
  ALL_PRODUCTS_LINK,
  collectionHref,
  FIXED_NAV_ITEMS,
  type NavItem,
  type NavLink,
} from "@/lib/site";

/**
 * Navigation built from the published RANGE collections (names and order from the admin,
 * cached under the `nav` tag), so renaming a range renames the menu and unpublishing or
 * deleting one removes it everywhere instead of leaving a dead link. Research, About Us and
 * Contact are fixed items after the ranges.
 */

/** A range's dropdown lists its products when there are at most this many. */
const MAX_LISTED_PRODUCTS = 8;

function rangeItem(range: NavCollection): NavItem {
  const href = collectionHref(range.slug);
  const children: NavLink[] = [{ label: `All ${range.name}`, href }];
  if (range.products.length <= MAX_LISTED_PRODUCTS) {
    children.push(
      ...range.products.map((product) => ({
        label: product.name,
        href: `/products/${product.slug}`,
      })),
    );
  }
  return { label: range.name, href, children };
}

/** Header and drawer: every published range, then Research, About Us and Contact. */
export async function getPrimaryNav(): Promise<NavItem[]> {
  const ranges = await getNavCollections();
  return [...ranges.map(rangeItem), ...FIXED_NAV_ITEMS];
}

/** "All products" and each published range: the listing pills and the footer column. */
export async function getCatalogueLinks(): Promise<NavLink[]> {
  const ranges = await getNavCollections();
  return [
    { label: "All products", href: ALL_PRODUCTS_LINK.href },
    ...ranges.map((range) => ({ label: range.name, href: collectionHref(range.slug) })),
  ];
}
