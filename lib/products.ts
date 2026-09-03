import {
  CollectionStatus,
  Prisma,
  ProductStatus,
  RedirectEntityType,
  VariantStatus,
} from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";

/* -------------------------------------------------------------------------- */
/*  Queries                                                                   */
/* -------------------------------------------------------------------------- */

const variantOrder = [
  { displayOrder: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.ProductVariantOrderByWithRelationInput[];
const imageOrder = [
  { isPrimary: "desc" },
  { displayOrder: "asc" },
  { createdAt: "asc" },
] satisfies Prisma.ProductImageOrderByWithRelationInput[];

/** Everything the product detail page renders — nothing more. */
const productDetailInclude = {
  variants: {
    where: { status: VariantStatus.ACTIVE },
    orderBy: variantOrder,
    include: { documentation: { orderBy: { createdAt: "asc" } } },
  },
  images: { orderBy: imageOrder },
  documentation: { orderBy: { createdAt: "asc" } },
  collections: {
    where: { collection: { status: CollectionStatus.PUBLISHED } },
    orderBy: { displayOrder: "asc" },
    include: { collection: { select: { id: true, slug: true, name: true } } },
  },
} satisfies Prisma.ProductInclude;

export type ProductDetail = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

/** What a product card needs. Shared with lib/collections.ts. */
export const productSummaryInclude = {
  variants: {
    where: { status: VariantStatus.ACTIVE },
    orderBy: variantOrder,
    select: {
      id: true,
      label: true,
      price: true,
      salePrice: true,
      saleStartsAt: true,
      saleEndsAt: true,
    },
  },
  images: { orderBy: imageOrder, take: 1, select: { url: true, altText: true } },
} satisfies Prisma.ProductInclude;

export type ProductSummary = Prisma.ProductGetPayload<{ include: typeof productSummaryInclude }>;

/**
 * Published product by slug, with active variants (ordered), images (primary first),
 * product-level and variant-level documentation, and published collections.
 * Cached per request so generateMetadata and the page share one query.
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  return prisma.product.findFirst({
    where: { slug, status: ProductStatus.PUBLISHED },
    include: productDetailInclude,
  });
});

/** Target slug for a renamed product, or null when no redirect is recorded. */
export async function getProductRedirectTarget(fromSlug: string): Promise<string | null> {
  const redirect = await prisma.slugRedirect.findFirst({
    where: { fromSlug, entityType: RedirectEntityType.PRODUCT },
    select: { toSlug: true },
  });
  return redirect?.toSlug ?? null;
}

/** Published products sharing at least one published collection with the given product. */
export async function getRelatedProducts(
  productId: string,
  limit: number,
): Promise<ProductSummary[]> {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.PUBLISHED,
      id: { not: productId },
      collections: {
        some: {
          collection: {
            status: CollectionStatus.PUBLISHED,
            products: { some: { productId } },
          },
        },
      },
    },
    include: productSummaryInclude,
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { name: "asc" }],
    take: limit,
  });
}

/** Every published product with primary image and active variants — for /products. */
export async function getAllProducts(): Promise<ProductSummary[]> {
  return prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    include: productSummaryInclude,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

/** Slugs of every published product — for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    select: { slug: true },
    orderBy: { slug: "asc" },
  });
  return rows.map((row) => row.slug);
}

/** Slug + last update of every published product — for the sitemap. */
export async function getProductsForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    select: { slug: true, updatedAt: true },
    orderBy: { slug: "asc" },
  });
}

/* -------------------------------------------------------------------------- */
/*  Pricing (integer cents, CAD)                                              */
/* -------------------------------------------------------------------------- */

type SaleFields = {
  price: number;
  salePrice: number | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
};

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});

/** Formats integer cents as a CAD amount, e.g. 38900 → "$389.00". */
export function formatCad(cents: number): string {
  return cadFormatter.format(cents / 100);
}

/**
 * A sale is active only when a lower sale price exists and `now` falls inside the
 * optional start/end window.
 */
export function isSaleActive(variant: SaleFields, now: Date): boolean {
  if (variant.salePrice === null || variant.salePrice >= variant.price) {
    return false;
  }
  if (variant.saleStartsAt && now < variant.saleStartsAt) {
    return false;
  }
  if (variant.saleEndsAt && now > variant.saleEndsAt) {
    return false;
  }
  return true;
}

export function effectivePriceCents(variant: SaleFields, now: Date): number {
  return isSaleActive(variant, now) && variant.salePrice !== null
    ? variant.salePrice
    : variant.price;
}

/** Serialisable variant model for the client-side selector. */
export type VariantView = {
  id: string;
  label: string;
  priceCents: number;
  /** Original price when a sale is active, otherwise null. */
  compareAtCents: number | null;
  trackInventory: boolean;
  stock: number | null;
};

export function toVariantViews(variants: ProductDetail["variants"], now: Date): VariantView[] {
  return variants.map((variant) => {
    const onSale = isSaleActive(variant, now);
    return {
      id: variant.id,
      label: variant.label,
      priceCents: onSale && variant.salePrice !== null ? variant.salePrice : variant.price,
      compareAtCents: onSale ? variant.price : null,
      trackInventory: variant.trackInventory,
      stock: variant.stock,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  View models                                                               */
/* -------------------------------------------------------------------------- */

export type ProductCardModel = {
  id: string;
  href: string;
  name: string;
  imageUrl: string | null;
  imageAlt: string;
  presentation: string | null;
  priceLabel: string | null;
};

export function toProductCardModel(product: ProductSummary, now: Date): ProductCardModel {
  const variantCount = product.variants.length;
  const prices = product.variants.map((variant) => effectivePriceCents(variant, now));
  const lowest = prices.length > 0 ? Math.min(...prices) : null;

  let priceLabel: string | null = null;
  if (lowest !== null) {
    priceLabel = variantCount > 1 ? `From ${formatCad(lowest)}` : formatCad(lowest);
  }

  const presentationParts: string[] = [];
  if (variantCount === 1) {
    presentationParts.push(product.variants[0].label);
  } else if (variantCount > 1) {
    presentationParts.push(`${variantCount} presentations`);
  }
  if (product.form) {
    presentationParts.push(product.form);
  }

  const image = product.images[0] ?? null;

  return {
    id: product.id,
    href: `/products/${product.slug}`,
    name: product.name,
    imageUrl: image?.url ?? null,
    imageAlt: image?.altText ?? product.name,
    presentation: presentationParts.length > 0 ? presentationParts.join(" · ") : null,
    priceLabel,
  };
}

export type SpecRow = { key: string; value: string };

/** Specification rows for populated fields only, in the approved order. */
export function specificationRows(product: ProductDetail): SpecRow[] {
  const candidates: Array<[string, string | null]> = [
    ["Form", product.form],
    ["Appearance", product.appearance],
    ["Storage conditions", product.storageConditions],
    ["CAS number", product.casNumber],
    ["Molecular formula", product.molecularFormula],
    ["Molecular weight", product.molecularWeight],
    ["Purity method", product.purityMethod],
  ];
  return candidates.flatMap(([key, value]) => {
    const trimmed = value?.trim();
    return trimmed ? [{ key, value: trimmed }] : [];
  });
}

export type DocumentRow = {
  id: string;
  title: string;
  fileUrl: string;
  batchLot: string | null;
  /** Upper-cased file extension, e.g. "PDF". */
  badge: string;
  /** Variant label for variant-level documents, otherwise null. */
  variantLabel: string | null;
};

/** File-type badge derived from the URL (the schema records no document type). */
export function fileBadge(fileUrl: string): string {
  const match = /\.([a-z0-9]{2,5})(?:[?#].*)?$/i.exec(fileUrl);
  return match ? match[1].toUpperCase() : "FILE";
}

/** Product-level documents first, then each variant's documents in variant order. */
export function collectDocuments(product: ProductDetail): DocumentRow[] {
  const productLevel = product.documentation.map((doc) => ({
    id: doc.id,
    title: doc.title,
    fileUrl: doc.fileUrl,
    batchLot: doc.batchLot,
    badge: fileBadge(doc.fileUrl),
    variantLabel: null,
  }));
  const variantLevel = product.variants.flatMap((variant) =>
    variant.documentation.map((doc) => ({
      id: doc.id,
      title: doc.title,
      fileUrl: doc.fileUrl,
      batchLot: doc.batchLot,
      badge: fileBadge(doc.fileUrl),
      variantLabel: variant.label,
    })),
  );
  return [...productLevel, ...variantLevel];
}

/** Splits stored description text into paragraphs on blank lines. */
export function descriptionParagraphs(text: string | null): string[] {
  if (!text) {
    return [];
  }
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}
