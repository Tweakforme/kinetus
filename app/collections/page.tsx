import type { Metadata } from "next";
import Link from "next/link";
import { CollectionCard } from "@/components/collection/CollectionCard";
import { ListingIntro } from "@/components/collection/ListingIntro";
import { ListingJsonLd } from "@/components/collection/ListingJsonLd";
import { ListingPage } from "@/components/collection/ListingPage";
import { Container } from "@/components/layout/Container";
import { getAllCollections } from "@/lib/collections";
import { canonicalUrl } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

const TITLE = "Collections";
const INTRO = `${SITE_NAME} research materials, grouped into collections.`;

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

/**
 * /collections — hub linking every published collection with the Figma Collection Card
 * treatment (40:57), text-led because Collection carries no image. 3 columns on desktop,
 * stacked on mobile.
 */
export default async function CollectionsPage() {
  const collections = await getAllCollections();
  const count = collections.length;

  return (
    <ListingPage>
      <ListingIntro eyebrow="Catalogue" title={TITLE} intro={INTRO} />

      <Container
        as="section"
        className={styles.section}
        aria-label="All collections"
        data-reveal=""
      >
        <p className={`type-body-s numeric ${styles.count}`}>
          Showing {count} {count === 1 ? "collection" : "collections"}
        </p>

        {count > 0 ? (
          <ul className={styles.grid}>
            {collections.map((collection) => (
              <li key={collection.id} className={styles.item} data-reveal="">
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p className={`type-body ${styles.emptyText}`}>No collections are published yet.</p>
            <Link href={ALL_PRODUCTS_LINK.href} className={`type-label ${styles.emptyLink}`}>
              {ALL_PRODUCTS_LINK.label}
            </Link>
          </div>
        )}
      </Container>

      <ListingJsonLd
        listName={TITLE}
        items={collections.map((collection) => ({
          name: collection.name,
          url: canonicalUrl(`/collections/${collection.slug}`),
        }))}
      />
    </ListingPage>
  );
}
