import type { Prisma, RedirectEntityType } from "@prisma/client";

/**
 * Records a slug change so the old address redirects permanently to the new one.
 *
 *  - Earlier redirects that pointed at the old slug are re-pointed at the new one, so a
 *    product renamed twice never redirects through a chain.
 *  - A redirect from the new slug is removed: that address is live again.
 *  - The old slug gets (or replaces) its own redirect.
 *
 * SlugRedirect.fromSlug is unique across products and collections, so a product and a
 * collection cannot both redirect from the same slug; the most recent change wins.
 */
export async function recordSlugChange(
  tx: Prisma.TransactionClient,
  entityType: RedirectEntityType,
  fromSlug: string,
  toSlug: string,
): Promise<void> {
  if (fromSlug === toSlug) {
    return;
  }
  await tx.slugRedirect.deleteMany({ where: { fromSlug: toSlug, entityType } });
  await tx.slugRedirect.updateMany({
    where: { toSlug: fromSlug, entityType },
    data: { toSlug },
  });
  await tx.slugRedirect.upsert({
    where: { fromSlug },
    create: { fromSlug, toSlug, entityType },
    update: { toSlug, entityType },
  });
}
