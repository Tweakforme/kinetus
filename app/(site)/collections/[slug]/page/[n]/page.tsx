import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CollectionListingPage,
  collectionListingMetadata,
} from "@/components/collection/CollectionListingPage";
import { pageCount, parsePageParam } from "@/lib/catalogue";
import { getAllCollections } from "@/lib/collections";

type CollectionPagedProps = {
  params: Promise<{ slug: string; n: string }>;
};

// Regenerated like the base collection route (on-demand tags and sale boundaries).

/** Every page from 2 up to the last page of each published collection. */
export async function generateStaticParams() {
  const collections = await getAllCollections();
  return collections.flatMap((collection) => {
    const total = pageCount(collection.productCount);
    return Array.from({ length: Math.max(0, total - 1) }, (_, index) => ({
      slug: collection.slug,
      n: String(index + 2),
    }));
  });
}

export async function generateMetadata({ params }: CollectionPagedProps): Promise<Metadata> {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  return page === null ? {} : collectionListingMetadata(slug, page);
}

/**
 * `/collections/[slug]/page/[n]` for n >= 2. Anything that is not a whole number from 2
 * up, or that lies past the last page, is a 404; page 1 is only ever the base URL.
 */
export default async function CollectionPagedPage({ params }: CollectionPagedProps) {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  if (page === null) {
    notFound();
  }
  return <CollectionListingPage slug={slug} page={page} />;
}
