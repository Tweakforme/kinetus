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
import { imagesForVariant } from "@/lib/product-images";
import { revalidateAtNextPriceChange, toProductCardModel } from "@/lib/products";
import { absoluteUrl, canonicalUrl, DEFAULT_DESCRIPTION } from "@/lib/seo";
import { COLLECTION_SLUGS, collectionHref, RESEARCH_LINK, SITE_NAME } from "@/lib/site";
import { sortListing, withSort, type SortKey } from "@/lib/sort";
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
  /** From `?sort=`; null keeps the collection's own order. */
  sort: SortKey | null;
};

/** Shown on an empty range other than Research, above the documentation section. */
const EMPTY_RANGE_MESSAGE = "No products are published in this range yet.";

/**
 * Metadata for `/collections/[slug]` (page 1) and `/collections/[slug]/page/[n]`.
 * Page 1's canonical is the base URL; page N's canonical is its own URL; neither ever
 * carries `?sort=`. Unknown
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
  // The first card's render, resolved exactly as the card resolves it.
  const firstImage = collection.products
    .map((link) => imagesForVariant(link.product.images, link.product.variants[0]?.id ?? null)[0])
    .find((image) => image !== undefined);
  const shareImages = firstImage
    ? [{ url: absoluteUrl(firstImage.url), alt: firstImage.altText }]
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
 * Collection listing shared by the base route and the paginated route: the collection's
 * name as the hero headline and its subtitle (or the approved COLLECTION_HERO copy) below, the divider "{name} Catalogue",
 * the pill bar with this range current, twelve cards per page and pagination. Research
 * always shows the batch documentation section; any other empty range shows it with a
 * short line. Renamed slugs redirect permanently; unknown slugs and pages past the end
 * are 404s.
 */
export async function CollectionListingPage({ slug, page, sort }: CollectionListingProps) {
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    const target = await getCollectionRedirectTarget(slug);
    if (target) {
      permanentRedirect(pageHref(collectionHref(target), page));
    }
    // The Research range is unpublished while the /research page stands in for it; its old
    // URL goes there. If the client publishes the range again, the collection renders.
    if (slug === COLLECTION_SLUGS.research) {
      permanentRedirect(RESEARCH_LINK.href);
    }
    notFound();
  }

  const now = new Date();
  const cards = sortListing(
    collection.products.map((link) => toProductCardModel(link.product, now)),
    sort,
  );
  const slice = paginate(cards, page);
  if (page > slice.totalPages) {
    notFound();
  }
  const shownIds = new Set(slice.items.map((card) => card.id));
  await revalidateAtNextPriceChange(
    collection.products
      .filter((link) => shownIds.has(link.product.id))
      .flatMap((link) => link.product.variants),
    now,
  );

  const base = collectionHref(collection.slug);
  const isResearch = collection.slug === COLLECTION_SLUGS.research;
  // Headline is always the collection's name, so a rename in the admin flows through;
  // the paragraph is its subtitle, falling back to the approved copy while that is empty.
  // The button scrolls to this collection's own grid, so a collection without approved
  // copy (the categories) says "View products", never "View all products".
  const approved = COLLECTION_HERO[collection.slug];
  const hero = {
    headline: collection.name,
    paragraph:
      collection.subtitle?.trim() || approved?.paragraph || DEFAULT_COLLECTION_HERO.paragraph,
    ctaLabel: approved?.ctaLabel ?? "View products",
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
        hrefFor={(target) => withSort(pageHref(base, target), sort)}
        sort={{ base, current: sort }}
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
