import { CollectionStatus, Prisma, ProductStatus, RedirectEntityType } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { productSummaryInclude } from "@/lib/products";

/** Cache tag for everything derived from published collections (nav, footer). */
export const COLLECTIONS_CACHE_TAG = "collections";

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

/**
 * Published collection by slug with its published products in membership order.
 * Cached per request so generateMetadata and the page share one query.
 */
export const getCollectionBySlug = cache(async (slug: string): Promise<CollectionDetail | null> => {
  return prisma.collection.findFirst({
    where: { slug, status: CollectionStatus.PUBLISHED },
    include: collectionDetailInclude,
  });
});

export type CollectionSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Count of PUBLISHED member products only. */
  productCount: number;
};

/** Every published collection with its published-product count, in display order. */
export async function getAllCollections(): Promise<CollectionSummary[]> {
  const rows = await prisma.collection.findMany({
    where: { status: CollectionStatus.PUBLISHED },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
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
    productCount: row._count.products,
  }));
}

/** Slugs of every published collection — for generateStaticParams. */
export async function getAllCollectionSlugs(): Promise<string[]> {
  const rows = await prisma.collection.findMany({
    where: { status: CollectionStatus.PUBLISHED },
    select: { slug: true },
    orderBy: { slug: "asc" },
  });
  return rows.map((row) => row.slug);
}

/** Slug + last update of every published collection — for the sitemap. */
export async function getCollectionsForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.collection.findMany({
    where: { status: CollectionStatus.PUBLISHED },
    select: { slug: true, updatedAt: true },
    orderBy: { slug: "asc" },
  });
}

/** Target slug for a renamed collection, or null when no redirect is recorded. */
export async function getCollectionRedirectTarget(fromSlug: string): Promise<string | null> {
  const redirect = await prisma.slugRedirect.findFirst({
    where: { fromSlug, entityType: RedirectEntityType.COLLECTION },
    select: { toSlug: true },
  });
  return redirect?.toSlug ?? null;
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
  /** Published member products in membership order — the dropdown / accordion entries. */
  products: NavProduct[];
};

/**
 * Published collections (with their published products) for the header dropdowns, the
 * drawer accordions and the footer, in display order. Cached across requests
 * (revalidated hourly, or on demand via COLLECTIONS_CACHE_TAG once the admin lands in
 * Phase 7) so the shell never queries per render.
 */
export const getNavCollections = unstable_cache(
  async (): Promise<NavCollection[]> => {
    const rows = await prisma.collection.findMany({
      where: { status: CollectionStatus.PUBLISHED },
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
  ["nav-collections", "with-products"],
  { revalidate: 3600, tags: [COLLECTIONS_CACHE_TAG] },
);
