import type { MetadataRoute } from "next";
import { getCollectionsForSitemap } from "@/lib/collections";
import { getProductsForSitemap } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { STATIC_ROUTES } from "@/lib/site";

/**
 * Sitemap — static top-level routes (including /products and /collections) plus every
 * PUBLISHED product and collection with its real last-modified date.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getProductsForSitemap(),
    getCollectionsForSitemap(),
  ]);

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: canonicalUrl(path),
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
