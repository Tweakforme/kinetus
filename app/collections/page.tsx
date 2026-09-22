import type { Metadata } from "next";
import Link from "next/link";
import { CollectionCard } from "@/components/collection/CollectionCard";
import {
  CATALOGUE_NOTE,
  CATALOGUE_SUBTITLE,
  LISTING_RENDER,
} from "@/components/collection/listingAssets";
import { ListingJsonLd } from "@/components/collection/ListingJsonLd";
import { ListingPage } from "@/components/collection/ListingPage";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
import { PageHero } from "@/components/ui/PageHero";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { getAllCollections } from "@/lib/collections";
import { canonicalUrl } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, collectionHref, SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

const TITLE = "Research Material Categories";
const INTRO = `${SITE_NAME} research materials grouped by range. Every unit carries a batch reference, and batch-specific documentation is available on request.`;

/** Hourly regeneration, matching the product and collection pages. */
export const revalidate = 3600;

const canonical = canonicalUrl("/collections");

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

/** Cards in the first row load their render eagerly. */
const FIRST_ROW = 2;

/**
 * /collections: the category hub. The navy hero, the "Research Materials" divider, and
 * every published collection as a large card (render, name, description, count,
 * "View all") in a 2 x 2 grid from 768px, stacked below.
 */
export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <ListingPage>
      <PageHero
        variant="category"
        headline={TITLE}
        headingId="collections-heading"
        paragraph={INTRO}
        cta={{ label: ALL_PRODUCTS_LINK.label, href: ALL_PRODUCTS_LINK.href }}
        image={LISTING_RENDER}
      />

      <Container
        as="section"
        className={styles.section}
        aria-labelledby="collections-grid-heading"
        data-reveal=""
      >
        <SectionDivider
          id="collections-grid-heading"
          title="Research Materials"
          subtitle={CATALOGUE_SUBTITLE}
          note={CATALOGUE_NOTE}
          nodes
        />

        {collections.length > 0 ? (
          <ul className={styles.grid}>
            {collections.map((collection, index) => (
              <li key={collection.id} className={styles.item} data-reveal="">
                <CollectionCard collection={collection} priority={index < FIRST_ROW} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p className={`type-body ${styles.emptyText}`}>No collections are published yet.</p>
            <Link href={ALL_PRODUCTS_LINK.href} className={buttons.outline}>
              {ALL_PRODUCTS_LINK.label}
            </Link>
          </div>
        )}
      </Container>

      <ListingJsonLd
        listName={TITLE}
        items={collections.map((collection) => ({
          name: collection.name,
          url: canonicalUrl(collectionHref(collection.slug)),
        }))}
      />
    </ListingPage>
  );
}
