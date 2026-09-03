import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/**
 * Page metadata for a static content route: title, description, canonical, share card.
 * Nested metadata objects replace the root layout's rather than merge, so the share
 * image is restated here (as the catalogue routes do).
 */
export function contentMetadata(title: string, description: string, path: string): Metadata {
  const canonical = canonicalUrl(path);
  const shareImage = { url: canonicalUrl("/kinetus-logo.png"), alt: SITE_NAME };
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_CA",
      url: canonical,
      title,
      description,
      images: [shareImage],
    },
    twitter: { card: "summary", title, description, images: [shareImage.url] },
  };
}
