import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin, the cart, checkout and order confirmations must never be indexed.
        disallow: ["/admin", "/cart", "/checkout", "/checkout/confirmation", "/api/"],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
