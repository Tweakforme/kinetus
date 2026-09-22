import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  COLLECTION_HERO,
  DEFAULT_COLLECTION_HERO,
  pageCount,
  pageHref,
  paginate,
} from "@/lib/catalogue";
import { getCollectionBySlug, getCollectionRedirectTarget } from "@/lib/collections";
import { toProductCardModel } from "@/lib/products";
import { canonicalUrl, DEFAULT_DESCRIPTION } from "@/lib/seo";
import { COLLECTION_SLUGS, collectionHref, SITE_NAME } from "@/lib/site";
import { CatalogueListing } from "./CatalogueListing";
import { DOCUMENTATION_SECTION_ID } from "./DocumentationSection";
import {
  CATALOGUE_NOTE,
  CATALOGUE_SECTION_ID,
  CATALOGUE_SUBTITLE,
  pagedTitle,
} from "./listingAssets";
import { ListingJsonLd } from "./ListingJsonLd";
import { ListingPage } from "./ListingPage";

type CollectionListingProps = {
  slug: string;
  /** 1-based page; the route has already validated it is a whole number. */
  page: number;
};

/** Shown on an empty range other than Research, above the documentation section. */
const EMPTY_RANGE_MESSAGE = "No products are published in this range yet.";

/**
 * Metadata for `/collections/[slug]` (page 1) and `/collections/[slug]/page/[n]`.
 * Page 1's canonical is the base URL; page N's canonical is its own URL. Unknown
 * collections and out-of-range pages return nothing; the page itself 404s.
 */
export async function collectionListingMetadata(slug: string, page: number): Promise<Metadata> {
  const collection = await getCollectionBySlug(slug);
  if (!collection || page > pageCount(collection.products.length)) {
    return {};
  }

  const title = pagedTitle(collection.metaTitle ?? collection.name, page);
  const description = collection.metaDescription ?? collection.description ?? DEFAULT_DESCRIPTION;
  const canonical = canonicalUrl(pageHref(collectionHref(collection.slug), page));
  const firstImage = collection.products.find((link) => link.product.images[0])?.product.images[0];
  const shareImages = firstImage
    ? [{ url: canonicalUrl(firstImage.url), alt: firstImage.altText }]
    : [{ url: canonicalUrl("/kinetus-logo.png"), alt: SITE_NAME }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_CA",
      url: canonical,
      title,
      description,
      images: shareImages,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: shareImages.map((image) => image.url),
    },
  };
}

/**
 * Collection listing shared by the base route and the paginated route: hero copy from
 * COLLECTION_HERO (falling back to the collection name), the divider "{name} Catalogue",
 * the pill bar with this range current, twelve cards per page and pagination. Research
 * always shows the batch documentation section; any other empty range shows it with a
 * short line. Renamed slugs redirect permanently; unknown slugs and pages past the end
 * are 404s.
 */
export async function CollectionListingPage({ slug, page }: CollectionListingProps) {
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    const target = await getCollectionRedirectTarget(slug);
    if (target) {
      permanentRedirect(pageHref(collectionHref(target), page));
    }
    notFound();
  }

  const now = new Date();
  const cards = collection.products.map((link) => toProductCardModel(link.product, now));
  const slice = paginate(cards, page);
  if (page > slice.totalPages) {
    notFound();
  }

  const base = collectionHref(collection.slug);
  const isResearch = collection.slug === COLLECTION_SLUGS.research;
  const hero = COLLECTION_HERO[collection.slug] ?? {
    headline: collection.name,
    ...DEFAULT_COLLECTION_HERO,
  };
  const ctaHref = `${base}#${isResearch ? DOCUMENTATION_SECTION_ID : CATALOGUE_SECTION_ID}`;

  return (
    <ListingPage>
      <CatalogueListing
        hero={{
          headline: hero.headline,
          headingId: "collection-heading",
          paragraph: hero.paragraph,
          cta: { label: hero.ctaLabel, href: ctaHref },
        }}
        divider={{
          id: "collection-catalogue-heading",
          title: `${collection.name} Catalogue`,
          subtitle: CATALOGUE_SUBTITLE,
          note: CATALOGUE_NOTE,
        }}
        activeHref={base}
        label={collection.name}
        products={slice.items}
        page={slice.page}
        totalPages={slice.totalPages}
        totalItems={slice.totalItems}
        hrefFor={(target) => pageHref(base, target)}
        emptyMessage={isResearch ? undefined : EMPTY_RANGE_MESSAGE}
        showDocumentation={isResearch}
      />

      <ListingJsonLd
        listName={pagedTitle(collection.name, page)}
        items={slice.items.map((product) => ({
          name: product.name,
          url: canonicalUrl(product.href),
        }))}
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "Products", url: canonicalUrl("/products") },
          { name: collection.name, url: canonicalUrl(base) },
        ]}
      />
    </ListingPage>
  );
}
