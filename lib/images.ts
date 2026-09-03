import placeholders from "./blur-placeholders.json";

/**
 * Tiny base64 previews for the images under public/, generated at build by
 * scripts/blur-placeholders.mjs (runs on `prebuild`). Keyed by public URL path.
 * Images without an entry (e.g. future uploads) render without a placeholder.
 */
const BLUR_PLACEHOLDERS: Record<string, string> = placeholders;

export function blurPlaceholder(url: string): string | undefined {
  return BLUR_PLACEHOLDERS[url];
}
