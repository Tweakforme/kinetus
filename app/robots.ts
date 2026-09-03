import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin (Phase 7) and order-request (Phase 8) areas must never be indexed.
        disallow: ["/admin", "/request"],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
