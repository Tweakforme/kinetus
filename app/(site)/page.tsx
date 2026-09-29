import type { Metadata } from "next";
import { ListingJsonLd } from "@/components/collection/ListingJsonLd";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { HomeHero } from "@/components/home/HomeHero";
import { ShopAllBar } from "@/components/home/ShopAllBar";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import styles from "@/components/home/HomePage.module.css";
import { StickyTrustBar } from "@/components/layout/StickyTrustBar";
import {
  getFeaturedProducts,
  revalidateAtNextPriceChange,
  toProductCardModel,
} from "@/lib/products";
import { canonicalUrl, defaultShareImage } from "@/lib/seo";
import { SITE_NAME, TRUST_BAR_SITE_WIDE } from "@/lib/site";

// Statically generated. Regenerated when an admin save expires the product tags (see
// lib/cache.ts), or when a featured product's scheduled sale starts or ends.

const DESCRIPTION =
  "Canadian supplier of research materials, catalogued by collection with batch-specific documentation. For Research Use Only. Not for Human or Animal Use.";

/** Two desktop rows of four (the seed flags eight products as featured). */
const FEATURED_LIMIT = 8;

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
    images: [defaultShareImage()],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [defaultShareImage().url],
  },
};

/**
 * Homepage (the client's homepage mockup and deck slide 4): navy hero, the SHOP ALL
 * PRODUCTS bar, "SHOP BY CATEGORY" with the six category cards, then "FEATURED MATERIALS"
 * with the featured product grid and the "VIEW ALL PRODUCTS" button. The supplier-facts
 * bar closes the page, directly above the research-use band and footer that come from the
 * root layout (unless TRUST_BAR_SITE_WIDE moves it there). It sits inside the lower part
 * of the page, which bounds its stickiness: on wide screens it is pinned to the bottom of
 * the window only while that part is on screen, so it never covers the hero or the SHOP
 * ALL PRODUCTS bar.
 */
export default async function Home() {
  const now = new Date();
  const products = await getFeaturedProducts(FEATURED_LIMIT);
  await revalidateAtNextPriceChange(
    products.flatMap((product) => product.variants),
    now,
  );
  const cards = products.map((product) => toProductCardModel(product, now));

  return (
    <>
      <div className={styles.page}>
        <HomeHero />
        <ShopAllBar className={styles.shopAll} />
        <div className={styles.lower}>
          <div className={styles.sections}>
            <ShopByCategory headingId="home-categories-heading" showAllProducts={false} />
            <FeaturedGrid products={cards} />
          </div>
          {!TRUST_BAR_SITE_WIDE && <StickyTrustBar />}
        </div>
      </div>
      <ListingJsonLd
        listName="Featured products"
        items={cards.map((card) => ({ name: card.name, url: canonicalUrl(card.href) }))}
      />
    </>
  );
}
