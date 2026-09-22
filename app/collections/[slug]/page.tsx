import type { Metadata } from "next";
import {
  CollectionListingPage,
  collectionListingMetadata,
} from "@/components/collection/CollectionListingPage";
import { getAllCollectionSlugs } from "@/lib/collections";

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
  return collectionListingMetadata(slug, 1);
}

/** `/collections/[slug]`: page 1 of the collection listing. Pages 2+ live under /page/[n]. */
export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  return <CollectionListingPage slug={slug} page={1} />;
}
