import {
  CollectionStatus,
  Prisma,
  ProductStatus,
  RedirectEntityType,
  VariantStatus,
} from "@prisma/client";
import { cache } from "react";
import { CACHE_TAGS, cachedQuery, regenerateAt } from "@/lib/cache";
import { prisma } from "@/lib/db";
import { imagesForVariant } from "@/lib/product-images";
import { effectivePriceCents, formatCad, isSaleActive, type SaleFields } from "@/lib/pricing";

/* -------------------------------------------------------------------------- */
/*  Queries                                                                   */
/*                                                                            */
/*  Catalogue reads go through cachedQuery (lib/cache.ts): cached until an    */
/*  admin save expires their tags. Build-time helpers (static params) and the */
/*  request-time search are not cached.                                       */
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
      trackInventory: true,
      stock: true,
    },
  },
  // Every image with its variant: the card shows what the product page shows on load.
  images: { orderBy: imageOrder, select: { url: true, altText: true, variantId: true } },
} satisfies Prisma.ProductInclude;

export type ProductSummary = Prisma.ProductGetPayload<{ include: typeof productSummaryInclude }>;

const productBySlug = cachedQuery(
  "product-by-slug",
  (slug: string) =>
    prisma.product.findFirst({
      where: { slug, status: ProductStatus.PUBLISHED },
      include: productDetailInclude,
    }),
  (slug) => [CACHE_TAGS.products, CACHE_TAGS.product(slug), CACHE_TAGS.collections],
);

/**
 * Published product by slug, with active variants (ordered), images (primary first),
 * product-level and variant-level documentation, and published collections.
 * Deduplicated per request so generateMetadata and the page share one read.
 */
export const getProductBySlug = cache((slug: string): Promise<ProductDetail | null> =>
  productBySlug(slug),
);

const productRedirectTarget = cachedQuery(
  "product-redirect",
  async (fromSlug: string) => {
    const redirect = await prisma.slugRedirect.findFirst({
      where: { fromSlug, entityType: RedirectEntityType.PRODUCT },
      select: { toSlug: true },
    });
    return redirect?.toSlug ?? null;
  },
  (fromSlug) => [CACHE_TAGS.products, CACHE_TAGS.product(fromSlug)],
);

/** Target slug for a renamed product, or null when no redirect is recorded. */
export function getProductRedirectTarget(fromSlug: string): Promise<string | null> {
  return productRedirectTarget(fromSlug);
}

/** Published products sharing at least one published collection with the given product. */
export const getRelatedProducts = cachedQuery(
  "related-products",
  (productId: string, limit: number): Promise<ProductSummary[]> =>
    prisma.product.findMany({
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
    }),
  () => [CACHE_TAGS.products, CACHE_TAGS.collections],
);

/** Every published product with its images and active variants, for /products. */
export const getAllProducts = cachedQuery(
  "all-products",
  (): Promise<ProductSummary[]> =>
    prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      include: productSummaryInclude,
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
  () => [CACHE_TAGS.products],
);

/**
 * Featured products (featured = true) for the homepage. If none are flagged, the most
 * recently created published products stand in, and the server log notes it.
 */
export const getFeaturedProducts = cachedQuery(
  "featured-products",
  async (limit: number): Promise<ProductSummary[]> => {
    const featured = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED, featured: true },
      include: productSummaryInclude,
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      take: limit,
    });
    if (featured.length > 0) {
      return featured;
    }
    console.warn("[home] No featured products are published; showing the most recent instead.");
    return prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      include: productSummaryInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
  () => [CACHE_TAGS.products],
);

/** Slugs of every published product — for generateStaticParams. */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    select: { slug: true },
    orderBy: { slug: "asc" },
  });
  return rows.map((row) => row.slug);
}

/** Slug + last update of every published product, for the sitemap. */
export const getProductsForSitemap = cachedQuery(
  "products-for-sitemap",
  (): Promise<{ slug: string; updatedAt: Date }[]> =>
    prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
  () => [CACHE_TAGS.products],
);

export type TestReportProduct = {
  slug: string;
  name: string;
  reports: { variantId: string; label: string; url: string; updatedAt: Date | null }[];
};

/**
 * Published products with at least one active variant carrying a third-party test report
 * link (set by the client in the admin), grouped by product, for /documentation. Only
 * real links are returned; nothing is filled in.
 */
export const getTestReports = cachedQuery(
  "test-reports",
  async (): Promise<TestReportProduct[]> => {
    const rows = await prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        variants: { some: { status: VariantStatus.ACTIVE, testReportUrl: { not: null } } },
      },
      select: {
        slug: true,
        name: true,
        variants: {
          where: { status: VariantStatus.ACTIVE, testReportUrl: { not: null } },
          orderBy: variantOrder,
          select: { id: true, label: true, testReportUrl: true, testReportUpdatedAt: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      reports: row.variants.map((variant) => ({
        variantId: variant.id,
        label: variant.label,
        url: variant.testReportUrl ?? "",
        updatedAt: variant.testReportUpdatedAt,
      })),
    }));
  },
  () => [CACHE_TAGS.products],
);

/**
 * Active volume discount tiers, shown on every product page. Tagged `products`, so a tier
 * save in the admin expires the product pages (lib/admin/revalidate.ts).
 */
export const getVolumeTiers = cachedQuery(
  "volume-tiers",
  () =>
    prisma.volumeDiscountTier.findMany({
      where: { isActive: true },
      orderBy: { minQuantity: "asc" },
      select: { minQuantity: true, percentOff: true, isActive: true },
    }),
  () => [CACHE_TAGS.products],
);

/* -------------------------------------------------------------------------- */
/*  Pricing (integer cents, CAD)                                              */
/* -------------------------------------------------------------------------- */

// Formatting and sale rules live with the rest of the pricing rules (lib/pricing.ts).
export { effectivePriceCents, formatCad, isSaleActive };

/** The next moment after `now` at which any of these variants' sale starts or ends. */
export function nextSaleBoundary(variants: SaleFields[], now: Date): Date | null {
  let next: Date | null = null;
  for (const variant of variants) {
    if (variant.salePrice === null || variant.salePrice >= variant.price) {
      continue;
    }
    for (const moment of [variant.saleStartsAt, variant.saleEndsAt]) {
      if (moment && moment > now && (next === null || moment < next)) {
        next = moment;
      }
    }
  }
  return next;
}

/**
 * Statically generated pages evaluate sale windows when they render. Call this with every
 * variant a page prices, so the page regenerates when the next sale starts or ends.
 */
export function revalidateAtNextPriceChange(variants: SaleFields[], now: Date): Promise<void> {
  return regenerateAt(nextSaleBoundary(variants, now), now);
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
  /** This size's third-party test report link, set by the client in the admin. */
  testReportUrl: string | null;
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
      testReportUrl: variant.testReportUrl,
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
  /** "10 mg · Lyophilized powder" (first presentation, then form). */
  subline: string | null;
  /** Lowest active price, formatted ("$80.00"). */
  priceLabel: string | null;
  /** True when several presentations carry different prices (the card shows "From"). */
  fromPrice: boolean;
  /** Lowest active price in cents, for sorting; null without an active variant. */
  lowestPriceCents: number | null;
  variantCount: number;
  /** Every active size has tracked stock at 0: the card shows a Sold out pill. */
  soldOut: boolean;
};

export function toProductCardModel(product: ProductSummary, now: Date): ProductCardModel {
  const variantCount = product.variants.length;
  const prices = product.variants.map((variant) => effectivePriceCents(variant, now));
  const lowest = prices.length > 0 ? Math.min(...prices) : null;
  const highest = prices.length > 0 ? Math.max(...prices) : null;

  const sublineParts: string[] = [];
  if (variantCount > 0) {
    sublineParts.push(product.variants[0].label);
  }
  if (product.form) {
    sublineParts.push(product.form);
  }

  // The subline names the first variant, so the card shows that variant's render (or the
  // product-level fallback): exactly what the product page shows on load.
  const image = imagesForVariant(product.images, product.variants[0]?.id ?? null)[0] ?? null;

  return {
    id: product.id,
    href: `/products/${product.slug}`,
    name: product.name,
    imageUrl: image?.url ?? null,
    imageAlt: image?.altText ?? product.name,
    subline: sublineParts.length > 0 ? sublineParts.join(" · ") : null,
    priceLabel: lowest !== null ? formatCad(lowest) : null,
    fromPrice: lowest !== null && highest !== null && highest > lowest,
    lowestPriceCents: lowest,
    variantCount,
    soldOut:
      variantCount > 0 &&
      product.variants.every((variant) => variant.trackInventory && (variant.stock ?? 0) <= 0),
  };
}

/**
 * Images the product page may show: product-level images plus those of active variants.
 * An archived strength's render is never shipped to the page.
 */
export function pageImages(product: ProductDetail): ProductDetail["images"] {
  const active = new Set(product.variants.map((variant) => variant.id));
  return product.images.filter((image) => image.variantId === null || active.has(image.variantId));
}

/** What the product page shows on load (the first variant's images, else product level). */
export function defaultImages(product: ProductDetail): ProductDetail["images"] {
  return imagesForVariant(product.images, product.variants[0]?.id ?? null);
}

/**
 * The product page's intro under the name when Admin > Settings "Product page text" is
 * blank. Neutral handling copy: how the unit arrives, nothing about what it does. The
 * research-use line is added after it (or after the admin's text) by ProductHero.
 */
export const DEFAULT_PRODUCT_INTRO =
  "Supplied in a sealed glass vial and labelled with a batch reference. Batch-specific documentation is available on request.";

/**
 * Admin > Settings "Product page text" (null while blank), shown on every product page.
 * Tagged `products`, so saving it expires the product pages.
 */
export const getProductIntroText = cachedQuery(
  "product-intro-text",
  async (): Promise<string | null> => {
    const settings = await prisma.storeSetting.findUnique({
      where: { id: "store" },
      select: { productIntroText: true },
    });
    return settings?.productIntroText ?? null;
  },
  () => [CACHE_TAGS.products],
);

/**
 * Product-page eyebrow by primary collection (deck slide 9 "RESEARCH PEPTIDE", slide 13
 * "RESEARCH PEPTIDE BLEND"). Neutral: names the kind of material, never a use.
 */
export function productKindLabel(collectionSlugs: string[]): string {
  if (collectionSlugs.includes("blends")) {
    return "Research peptide blend";
  }
  if (collectionSlugs.includes("lab-supplies")) {
    return "Lab supply";
  }
  return "Research peptide";
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


/* -------------------------------------------------------------------------- */
/*  Listing helpers (paginated index routes, sitemap, search)                 */
/* -------------------------------------------------------------------------- */

/** Longest query the search route accepts; longer input is truncated before querying. */
export const SEARCH_QUERY_MAX_LENGTH = 80;

/** Trims and truncates a raw `?q=` value; returns "" for anything unusable. */
export function normaliseSearchQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
}

/**
 * Published products whose name, or an active variant's label or SKU, contains the query
 * (case-insensitive), for /search. A plain `contains` query: 34 products need no index.
 */
export async function searchProducts(query: string, limit = 48): Promise<ProductSummary[]> {
  const term = query.trim();
  if (!term) {
    return [];
  }
  return prisma.product.findMany({
    where: {
      status: ProductStatus.PUBLISHED,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        {
          variants: {
            some: {
              status: VariantStatus.ACTIVE,
              OR: [
                { label: { contains: term, mode: "insensitive" } },
                { sku: { contains: term, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
    include: productSummaryInclude,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    take: limit,
  });
}
