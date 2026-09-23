import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin, the cart, checkout, order confirmations and search results must never be
        // indexed.
        disallow: ["/admin", "/cart", "/checkout", "/checkout/confirmation", "/api/", "/search"],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
