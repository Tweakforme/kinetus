/**
 * Which images belong to which variant. Pure (no database access) so the product gallery,
 * a client component, can use the same rule as the server.
 *
 * A render printed with a strength belongs to that variant (`variantId`). Images with no
 * variant are product level. The rule: a variant shows its own images; a variant without
 * any shows the product-level images; a variant never shows another variant's render.
 * Input order is kept (primary first, then display order).
 */
export function imagesForVariant<Image extends { variantId: string | null }>(
  images: Image[],
  variantId: string | null,
): Image[] {
  if (variantId !== null) {
    const own = images.filter((image) => image.variantId === variantId);
    if (own.length > 0) {
      return own;
    }
  }
  return images.filter((image) => image.variantId === null);
}
