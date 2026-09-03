import type { Metadata } from "next";
import { CollectionLinks } from "@/components/collection/CollectionLinks";
import { ListingIntro } from "@/components/collection/ListingIntro";
import { ListingJsonLd } from "@/components/collection/ListingJsonLd";
import { ListingPage } from "@/components/collection/ListingPage";
import { ProductGrid } from "@/components/collection/ProductGrid";
import { getAllCollections } from "@/lib/collections";
import { getAllProducts, toProductCardModel } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { ALL_COLLECTIONS_LINK, SITE_NAME } from "@/lib/site";

const TITLE = "Products";
const INTRO = `The complete list of research materials currently published by ${SITE_NAME}.`;

/** Hourly regeneration, matching the product and collection pages. */
export const revalidate = 3600;

const canonical = canonicalUrl("/products");

export const metadata: Metadata = {
  title: TITLE,
  description: INTRO,
  alternates: { canonical },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    url: canonical,
    title: TITLE,
    description: INTRO,
    images: [{ url: canonicalUrl("/kinetus-logo.png"), alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: INTRO,
  },
};

/**
 * /products — the canonical full listing. Same intro, results bar and grid treatment as
 * the collection page (Figma 50:101 / 55:5), with the deck's classification bar rendered
 * as a row of collection links above the grid. No filters, sort or pagination.
 */
export default async function ProductsPage() {
  const now = new Date();
  const [productRows, collections] = await Promise.all([getAllProducts(), getAllCollections()]);
  const products = productRows.map((product) => toProductCardModel(product, now));
  const collectionLinks = collections.map((collection) => ({
    label: collection.name,
    href: `/collections/${collection.slug}`,
  }));

  return (
    <ListingPage>
      <ListingIntro eyebrow="Catalogue" title={TITLE} intro={INTRO} />

      <CollectionLinks
        heading="Browse by collection"
        links={collectionLinks}
        headingId="browse-collections-heading"
      />

      <ProductGrid
        products={products}
        label="All products"
        emptyMessage="No products are published yet."
        emptyLink={ALL_COLLECTIONS_LINK}
      />

      <ListingJsonLd
        listName={TITLE}
        items={products.map((product) => ({ name: product.name, url: canonicalUrl(product.href) }))}
      />
    </ListingPage>
  );
}
