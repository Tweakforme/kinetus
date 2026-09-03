import type { MetadataRoute } from "next";
import { getCollectionsForSitemap } from "@/lib/collections";
import { getProductsForSitemap } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { STATIC_ROUTES } from "@/lib/site";

/**
 * Sitemap — static top-level routes (including /products and /collections) plus every
 * PUBLISHED product and collection with its real last-modified date. The homepage lists
 * collections and featured products, so its lastModified is the newest of those.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getProductsForSitemap(),
    getCollectionsForSitemap(),
  ]);

  const catalogueTimestamps = [...products, ...collections].map((row) => row.updatedAt.getTime());
  const homeLastModified =
    catalogueTimestamps.length > 0 ? new Date(Math.max(...catalogueTimestamps)) : undefined;

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: canonicalUrl(path),
      ...(path === "/" && homeLastModified ? { lastModified: homeLastModified } : {}),
    })),
    ...collections.map((collection) => ({
      url: canonicalUrl(`/collections/${collection.slug}`),
      lastModified: collection.updatedAt,
    })),
    ...products.map((product) => ({
      url: canonicalUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt,
    })),
  ];
}
