import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_COLLECTION_HERO, pageHref, paginate } from "@/lib/catalogue";
import { getAllProducts, revalidateAtNextPriceChange, toProductCardModel } from "@/lib/products";
import { canonicalUrl, defaultShareImage } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, SITE_NAME } from "@/lib/site";
import { sortListing, withSort, type SortKey } from "@/lib/sort";
import { CatalogueListing } from "./CatalogueListing";
import {
  CATALOGUE_NOTE,
  CATALOGUE_SECTION_ID,
  CATALOGUE_SUBTITLE,
  pagedTitle,
} from "./listingAssets";
import { ListingJsonLd } from "./ListingJsonLd";
import { ListingPage } from "./ListingPage";

type ProductsListingProps = {
  /** 1-based page; the route has already validated it is a whole number. */
  page: number;
  /** From `?sort=`; null keeps the catalogue order. */
  sort: SortKey | null;
};

export const PRODUCTS_TITLE = "All Research Materials";
export const PRODUCTS_DESCRIPTION = `The complete list of research materials currently published by ${SITE_NAME}.`;

const BASE = ALL_PRODUCTS_LINK.href;

/**
 * Metadata for `/products` (page 1) and `/products/page/[n]`; each page is its own
 * canonical, always without `?sort=`, so sorted views never compete with it.
 */
export function productsListingMetadata(page: number): Metadata {
  const title = pagedTitle(PRODUCTS_TITLE, page);
  const canonical = canonicalUrl(pageHref(BASE, page));

  return {
    title,
    description: PRODUCTS_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_CA",
      url: canonical,
      title,
      description: PRODUCTS_DESCRIPTION,
      images: [defaultShareImage()],
    },
    twitter: {
      card: "summary",
      title,
      description: PRODUCTS_DESCRIPTION,
    },
  };
}

/**
 * The canonical full listing, in the same layout as every collection page: hero "All
 * Research Materials", the "Research Materials" divider with nodes, the pill bar with
 * "All Products" current, twelve cards per page and pagination. Pages past the end 404.
 */
export async function ProductsListingPage({ page, sort }: ProductsListingProps) {
  const now = new Date();
  const rows = await getAllProducts();
  const slice = paginate(
    sortListing(
      rows.map((product) => toProductCardModel(product, now)),
      sort,
    ),
    page,
  );
  if (page > slice.totalPages) {
    notFound();
  }
  const shownIds = new Set(slice.items.map((card) => card.id));
  await revalidateAtNextPriceChange(
    rows.filter((row) => shownIds.has(row.id)).flatMap((row) => row.variants),
    now,
  );

  return (
    <ListingPage>
      <CatalogueListing
        hero={{
          headline: PRODUCTS_TITLE,
          headingId: "products-heading",
          paragraph: DEFAULT_COLLECTION_HERO.paragraph,
          cta: { label: DEFAULT_COLLECTION_HERO.ctaLabel, href: `${BASE}#${CATALOGUE_SECTION_ID}` },
        }}
        divider={{
          id: "products-catalogue-heading",
          title: "Research Materials",
          subtitle: CATALOGUE_SUBTITLE,
          note: CATALOGUE_NOTE,
          nodes: true,
        }}
        activeHref={BASE}
        label="All products"
        products={slice.items}
        page={slice.page}
        totalPages={slice.totalPages}
        totalItems={slice.totalItems}
        hrefFor={(target) => withSort(pageHref(BASE, target), sort)}
        emptyMessage="No products are published yet."
        sort={{ base: BASE, current: sort }}
      />

      <ListingJsonLd
        listName={pagedTitle(PRODUCTS_TITLE, page)}
        items={slice.items.map((product) => ({
          name: product.name,
          url: canonicalUrl(product.href),
        }))}
      />
    </ListingPage>
  );
}
