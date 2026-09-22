import type { MetadataRoute } from "next";
import { pageCount, pageHref } from "@/lib/catalogue";
import { getAllCollections, getCollectionsForSitemap } from "@/lib/collections";
import { getProductsForSitemap } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, collectionHref, STATIC_ROUTES } from "@/lib/site";

/** `/base/page/2` up to the last page of a listing holding `totalItems` products. */
function pagedEntries(
  base: string,
  totalItems: number,
  lastModified?: Date,
): MetadataRoute.Sitemap {
  const total = pageCount(totalItems);
  return Array.from({ length: Math.max(0, total - 1) }, (_, index) => ({
    url: canonicalUrl(pageHref(base, index + 2)),
    ...(lastModified ? { lastModified } : {}),
  }));
}

/**
 * Sitemap: static top-level routes (including /products and /collections), the
 * paginated /products/page/N and /collections/{slug}/page/N routes for N >= 2, and every
 * PUBLISHED product and collection with its real last-modified date. The homepage lists
 * collections and featured products, so its lastModified is the newest of those.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, collectionCounts] = await Promise.all([
    getProductsForSitemap(),
    getCollectionsForSitemap(),
    getAllCollections(),
  ]);

  const catalogueTimestamps = [...products, ...collections].map((row) => row.updatedAt.getTime());
  const homeLastModified =
    catalogueTimestamps.length > 0 ? new Date(Math.max(...catalogueTimestamps)) : undefined;
  const countBySlug = new Map(collectionCounts.map((row) => [row.slug, row.productCount]));

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: canonicalUrl(path),
      ...(path === "/" && homeLastModified ? { lastModified: homeLastModified } : {}),
    })),
    ...pagedEntries(ALL_PRODUCTS_LINK.href, products.length, homeLastModified),
    ...collections.flatMap((collection) => [
      {
        url: canonicalUrl(collectionHref(collection.slug)),
        lastModified: collection.updatedAt,
      },
      ...pagedEntries(
        collectionHref(collection.slug),
        countBySlug.get(collection.slug) ?? 0,
        collection.updatedAt,
      ),
    ]),
    ...products.map((product) => ({
      url: canonicalUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt,
    })),
  ];
}
