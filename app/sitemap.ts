import type { MetadataRoute } from "next";
import { getProductsForSitemap } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { STATIC_ROUTES } from "@/lib/site";

/**
 * Sitemap — static top-level routes plus every PUBLISHED product with its real
 * last-modified date.
 *
 * TODO (Phase 4): add published collection slugs (`/collections/[slug]`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsForSitemap();

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: canonicalUrl(path),
    })),
    ...products.map((product) => ({
      url: canonicalUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt,
    })),
  ];
}
