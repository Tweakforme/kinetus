import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";
import { STATIC_ROUTES } from "@/lib/site";

/**
 * Sitemap — static top-level routes only for now.
 *
 * TODO (later phases): extend with dynamic product and collection slugs
 * (`/products/[slug]`, `/collections/[slug]`) pulled from the database, PUBLISHED only.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((path) => ({
    url: canonicalUrl(path),
  }));
}
