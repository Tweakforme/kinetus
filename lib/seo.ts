/**
 * SEO helpers reused by every phase: site origin resolution and canonical URLs.
 */

// TODO: confirm default meta description copy with AJ/Mike before launch.
export const DEFAULT_DESCRIPTION =
  "Canadian supplier of research materials. For Research Use Only. Not for Human or Animal Use.";

// Local-development fallback only. Never a production domain — set NEXT_PUBLIC_SITE_URL.
const LOCAL_FALLBACK_URL = "http://localhost:3000";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Public origin of the site, without a trailing slash.
 * Resolution order: NEXT_PUBLIC_SITE_URL → Vercel deployment URL (previews) → localhost.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${stripTrailingSlash(vercelUrl)}`;
  }
  return LOCAL_FALLBACK_URL;
}

/**
 * Absolute URL for an image or file. Site paths ("/products/…") resolve against the
 * origin; absolute URLs (admin uploads on Vercel Blob) pass through unchanged.
 */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : canonicalUrl(pathOrUrl);
}

/**
 * Absolute canonical URL for a site path.
 * Root resolves to `${origin}/`; other paths are normalised to a leading slash and
 * no trailing slash, e.g. canonicalUrl("products/") → `${origin}/products`.
 */
export function canonicalUrl(path: string = "/"): string {
  const origin = getSiteUrl();
  const normalised = `/${path.replace(/^\/+/, "")}`;
  if (normalised === "/") {
    return `${origin}/`;
  }
  return `${origin}${stripTrailingSlash(normalised)}`;
}
