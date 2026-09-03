import type { Metadata } from "next";
import { ProductStatus } from "@prisma/client";
import { ListingJsonLd } from "@/components/collection/ListingJsonLd";
import { ListingPage } from "@/components/collection/ListingPage";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { Hero } from "@/components/home/Hero";
import { QualitySection } from "@/components/home/QualitySection";
import { getAllCollections } from "@/lib/collections";
import { prisma } from "@/lib/db";
import { productSummaryInclude, toProductCardModel, type ProductSummary } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/** Hourly regeneration, matching the catalogue routes. */
export const revalidate = 3600;

/** Client product render (public/products, covered by the blur-placeholder pipeline). */
const HERO_IMAGE = "/products/kinetus-vial-and-blank-box.png";
const HERO_IMAGE_ALT = `${SITE_NAME} vial and box (product render)`;

const DESCRIPTION =
  "Canadian supplier of research materials, catalogued by collection with batch-specific documentation. For Research Use Only. Not for Human or Animal Use.";

const FEATURED_LIMIT = 4;

const canonical = canonicalUrl("/");

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: DESCRIPTION,
  alternates: { canonical },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    url: canonical,
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [{ url: canonicalUrl(HERO_IMAGE), alt: HERO_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [canonicalUrl(HERO_IMAGE)],
  },
};

/**
 * Featured products (featured = true). If none are flagged, the most recently created
 * published products stand in; the build log notes when that fallback is used.
 */
async function getHomeProducts(): Promise<ProductSummary[]> {
  const featured = await prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED, featured: true },
    include: productSummaryInclude,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    take: FEATURED_LIMIT,
  });
  if (featured.length > 0) {
    return featured;
  }
  console.warn("[home] No featured products are published; showing the most recent instead.");
  return prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    include: productSummaryInclude,
    orderBy: { createdAt: "desc" },
    take: FEATURED_LIMIT,
  });
}

/**
 * Homepage — deck arrangement executed in the approved system (Figma 38:44 / 55:3):
 * hero, collections, featured products, quality & documentation. The research-use band
 * and footer come from the root layout.
 */
export default async function Home() {
  const now = new Date();
  const [collections, products] = await Promise.all([getAllCollections(), getHomeProducts()]);
  const cards = products.map((product) => toProductCardModel(product, now));

  return (
    <ListingPage>
      <Hero imageUrl={HERO_IMAGE} imageAlt={HERO_IMAGE_ALT} />
      <CollectionsSection collections={collections} />
      <FeaturedSection products={cards} />
      <QualitySection />
      <ListingJsonLd
        listName="Featured products"
        items={cards.map((card) => ({ name: card.name, url: canonicalUrl(card.href) }))}
      />
    </ListingPage>
  );
}
