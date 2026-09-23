import {
  CollectionKind,
  CollectionStatus,
  Prisma,
  ProductStatus,
  RedirectEntityType,
} from "@prisma/client";
import { cache } from "react";
import { CACHE_TAGS, cachedQuery } from "@/lib/cache";
import { prisma } from "@/lib/db";
import { productSummaryInclude } from "@/lib/products";

/** Cache tag for everything derived from published collections (the admin expires it). */
export const COLLECTIONS_CACHE_TAG = CACHE_TAGS.collections;

/* -------------------------------------------------------------------------- */
/*  Queries                                                                   */
/* -------------------------------------------------------------------------- */

/** A collection with its published products, each carrying card data. */
const collectionDetailInclude = {
  products: {
    where: { product: { status: ProductStatus.PUBLISHED } },
    orderBy: { displayOrder: "asc" },
    include: { product: { include: productSummaryInclude } },
  },
} satisfies Prisma.CollectionInclude;

export type CollectionDetail = Prisma.CollectionGetPayload<{
  include: typeof collectionDetailInclude;
}>;

const collectionBySlug = cachedQuery(
  "collection-by-slug",
  (slug: string): Promise<CollectionDetail | null> =>
    prisma.collection.findFirst({
      where: { slug, status: CollectionStatus.PUBLISHED },
      include: collectionDetailInclude,
    }),
  (slug) => [CACHE_TAGS.collections, CACHE_TAGS.collection(slug), CACHE_TAGS.products],
);

/**
 * Published collection by slug with its published products in membership order.
 * Deduplicated per request so generateMetadata and the page share one read.
 */
export const getCollectionBySlug = cache((slug: string): Promise<CollectionDetail | null> =>
  collectionBySlug(slug),
);

export type CollectionSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Category icon (public/categories/*.webp or an admin upload); null for ranges. */
  iconUrl: string | null;
  /** Count of PUBLISHED member products only. */
  productCount: number;
};

/**
 * Every published collection with its published-product count, in display order.
 * Pass a kind to limit it: the /collections hub shows the four ranges only, so the Shop
 * by Category groupings the client adds in the admin do not change its layout.
 */
export const getAllCollections = cachedQuery(
  "all-collections",
  async (kind?: CollectionKind): Promise<CollectionSummary[]> => {
    const rows = await prisma.collection.findMany({
      where: { status: CollectionStatus.PUBLISHED, ...(kind ? { kind } : {}) },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        iconUrl: true,
        _count: {
          select: { products: { where: { product: { status: ProductStatus.PUBLISHED } } } },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      iconUrl: row.iconUrl,
      productCount: row._count.products,
    }));
  },
  () => [CACHE_TAGS.collections, CACHE_TAGS.products],
);

/** Slug + last update of every published collection, for the sitemap. */
export const getCollectionsForSitemap = cachedQuery(
  "collections-for-sitemap",
  (): Promise<{ slug: string; updatedAt: Date }[]> =>
    prisma.collection.findMany({
      where: { status: CollectionStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: "asc" },
    }),
  () => [CACHE_TAGS.collections],
);

const collectionRedirectTarget = cachedQuery(
  "collection-redirect",
  async (fromSlug: string) => {
    const redirect = await prisma.slugRedirect.findFirst({
      where: { fromSlug, entityType: RedirectEntityType.COLLECTION },
      select: { toSlug: true },
    });
    return redirect?.toSlug ?? null;
  },
  (fromSlug) => [CACHE_TAGS.collections, CACHE_TAGS.collection(fromSlug)],
);

/** Target slug for a renamed collection, or null when no redirect is recorded. */
export function getCollectionRedirectTarget(fromSlug: string): Promise<string | null> {
  return collectionRedirectTarget(fromSlug);
}

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export type NavProduct = {
  slug: string;
  name: string;
};

export type NavCollection = {
  slug: string;
  name: string;
  /** Published member products in membership order: the dropdown / accordion entries. */
  products: NavProduct[];
};

/**
 * Published ranges with their published products, in display order, for navigation built
 * from the catalogue. Tagged `nav` (and expired by every catalogue save). Not currently
 * rendered: since the deck-match redesign the header, drawer and footer use the static
 * navigation in lib/site.ts.
 */
export const getNavCollections = cachedQuery(
  "nav-collections",
  async (): Promise<NavCollection[]> => {
    const rows = await prisma.collection.findMany({
      where: { status: CollectionStatus.PUBLISHED, kind: CollectionKind.RANGE },
      select: {
        slug: true,
        name: true,
        products: {
          where: { product: { status: ProductStatus.PUBLISHED } },
          orderBy: { displayOrder: "asc" },
          select: { product: { select: { slug: true, name: true } } },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      products: row.products.map((link) => link.product),
    }));
  },
  () => [CACHE_TAGS.nav, CACHE_TAGS.collections, CACHE_TAGS.products],
);
