import { CollectionKind, CollectionStatus, type PrismaClient } from "@prisma/client";

/**
 * The client's six Shop by Category groupings (CATEGORY collections). Membership follows
 * the client's category page images in _client-assets/Shop by Category/, limited to
 * products that exist in the catalogue. Two exceptions confirmed by AJ on 2026-09-22:
 * Thymalin belongs to Longevity only (the images show a vial labelled THYMULIN, a
 * different peptide the catalogue does not carry), and Immune & Cellular Support holds
 * L-Glutathione and Thymosin Alpha-1 (the latter from the client's Classification Outline).
 *
 * Skipped because the catalogue has no such product: ARA-290, Cartalax, GLOW, SLU-PP-322
 * (Tissue Repair), FOX-04 (Longevity), IGF-1 LR3, PT-141 (Hormone), L-Carnitine (Immune).
 *
 * Descriptions and subtitles are deliberately left null: the client's outline describes
 * what these materials do, which the content rules forbid. The client fills them in the
 * admin.
 */
export const CATEGORIES = [
  {
    slug: "metabolic-weight-management",
    name: "Metabolic & Weight Management",
    products: [
      "5-amino-1mq",
      "aod-9604",
      "retatrutide",
      "semaglutide",
      "tirzepatide",
      "mots-c",
      "tesamorelin",
    ],
  },
  {
    slug: "tissue-repair-recovery",
    name: "Tissue Repair & Recovery",
    products: ["ahk-cu", "bpc-157", "ghk-cu", "klow", "kpv", "tb-500", "wolverine-blend"],
  },
  {
    slug: "longevity-cellular-aging",
    name: "Longevity & Cellular Aging",
    products: [
      "ahk-cu",
      "epitalon",
      "mots-c",
      "nad-plus",
      "pinealon",
      "pnc-27",
      "snap-8",
      "ss-31",
      "thymalin",
    ],
  },
  {
    slug: "neurological-cognitive",
    name: "Neurological & Cognitive",
    products: ["cerebrolysin", "dsip", "neuro-focus", "selank", "semax", "vip"],
  },
  {
    slug: "hormone-endocrine",
    name: "Hormone & Endocrine",
    products: [
      "cjc-1295-no-dac-ipamorelin",
      "ipamorelin",
      "kisspeptin",
      "sermorelin",
      "tesamorelin",
    ],
  },
  {
    slug: "immune-cellular-support",
    name: "Immune & Cellular Support",
    products: ["l-glutathione", "thymosin-alpha-1"],
  },
] as const;

export const categoryIconUrl = (slug: string) => `/categories/${slug}.webp`;

export type CategorySeedResult = {
  collectionsCreated: number;
  iconsSet: number;
  linksCreated: number;
  missingProducts: string[];
};

/**
 * Additive and idempotent. A category is created, together with its product links, in one
 * transaction, only when its slug is new. An existing category is never renamed,
 * republished, reordered or re-linked: if the client has removed a product from it in the
 * admin, a later run does not put it back. Only an empty icon is filled. Products and
 * their RANGE membership are never touched.
 */
export async function seedCategories(prisma: PrismaClient): Promise<CategorySeedResult> {
  const result: CategorySeedResult = {
    collectionsCreated: 0,
    iconsSet: 0,
    linksCreated: 0,
    missingProducts: [],
  };

  for (const [index, category] of CATEGORIES.entries()) {
    const existing = await prisma.collection.findUnique({
      where: { slug: category.slug },
      select: { id: true, kind: true, iconUrl: true },
    });
    if (existing) {
      if (existing.kind !== CollectionKind.CATEGORY) {
        throw new Error(
          `Slug "${category.slug}" is already used by a ${existing.kind} collection; stopping.`,
        );
      }
      if (!existing.iconUrl) {
        await prisma.collection.update({
          where: { id: existing.id },
          data: { iconUrl: categoryIconUrl(category.slug) },
        });
        result.iconsSet += 1;
      }
      continue;
    }

    const products = await prisma.product.findMany({
      where: { slug: { in: [...category.products] } },
      select: { id: true, slug: true },
    });
    const bySlug = new Map(products.map((product) => [product.slug, product.id]));
    const productIds: string[] = [];
    for (const slug of category.products) {
      const id = bySlug.get(slug);
      if (id) {
        productIds.push(id);
      } else {
        result.missingProducts.push(`${category.slug}: ${slug}`);
      }
    }

    await prisma.$transaction(async (tx) => {
      const created = await tx.collection.create({
        data: {
          slug: category.slug,
          name: category.name,
          kind: CollectionKind.CATEGORY,
          status: CollectionStatus.PUBLISHED,
          displayOrder: index + 1,
          iconUrl: categoryIconUrl(category.slug),
          description: null,
          subtitle: null,
        },
        select: { id: true },
      });
      await tx.productCollection.createMany({
        data: productIds.map((productId, order) => ({
          productId,
          collectionId: created.id,
          displayOrder: order + 1,
        })),
      });
    });
    result.collectionsCreated += 1;
    result.linksCreated += productIds.length;
  }
  return result;
}
