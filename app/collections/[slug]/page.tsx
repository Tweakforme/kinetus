import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CollectionLinks } from "@/components/collection/CollectionLinks";
import { ListingIntro } from "@/components/collection/ListingIntro";
import { ListingJsonLd } from "@/components/collection/ListingJsonLd";
import { ListingPage } from "@/components/collection/ListingPage";
import { ProductGrid } from "@/components/collection/ProductGrid";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import {
  getAllCollections,
  getAllCollectionSlugs,
  getCollectionBySlug,
  getCollectionRedirectTarget,
} from "@/lib/collections";
import { toProductCardModel } from "@/lib/products";
import { canonicalUrl, DEFAULT_DESCRIPTION } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, SITE_NAME } from "@/lib/site";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

/** Matches the product page: hourly regeneration until Phase 7 adds on-demand revalidation. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) {
    return {};
  }

  const title = collection.metaTitle ?? collection.name;
  const description = collection.metaDescription ?? collection.description ?? DEFAULT_DESCRIPTION;
  const canonical = canonicalUrl(`/collections/${collection.slug}`);
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
 * Collection detail — Figma "Collection — Desktop — MOCK" (50:101) / Mobile (55:5):
 * breadcrumb + intro, results bar + product grid, then links to the other collections.
 * No filters, sort or pagination. The research-use band is rendered by the root layout.
 */
export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    const target = await getCollectionRedirectTarget(slug);
    if (target) {
      permanentRedirect(`/collections/${target}`);
    }
    notFound();
  }

  const now = new Date();
  const products = collection.products.map((link) => toProductCardModel(link.product, now));
  const otherCollections = (await getAllCollections())
    .filter((other) => other.id !== collection.id)
    .map((other) => ({ label: other.name, href: `/collections/${other.slug}` }));

  const pageUrl = canonicalUrl(`/collections/${collection.slug}`);

  return (
    <ListingPage>
      <ListingIntro
        // Same "Home › Products › [name]" trail as the product page; the prop is named for
        // its original use but renders the current item generically.
        breadcrumb={<ProductBreadcrumb productName={collection.name} />}
        eyebrow="Collection"
        title={collection.name}
        intro={collection.description}
      />

      <ProductGrid
        products={products}
        label={collection.name}
        emptyMessage="No products are published in this collection yet."
        emptyLink={ALL_PRODUCTS_LINK}
      />

      <CollectionLinks
        heading="Other collections"
        links={otherCollections}
        headingId="other-collections-heading"
      />

      <ListingJsonLd
        listName={collection.name}
        items={products.map((product) => ({ name: product.name, url: canonicalUrl(product.href) }))}
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "Products", url: canonicalUrl("/products") },
          { name: collection.name, url: pageUrl },
        ]}
      />
    </ListingPage>
  );
}
