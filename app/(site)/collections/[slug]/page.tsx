import type { Metadata } from "next";
import {
  CollectionListingPage,
  collectionListingMetadata,
} from "@/components/collection/CollectionListingPage";
import { parseSort } from "@/lib/sort";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Rendered per request because of `?sort=`; the collection queries stay in the data cache
// (lib/cache.ts), so the database is only read after an admin save. The canonical never
// carries the sort.

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  return collectionListingMetadata(slug, 1);
}

/** `/collections/[slug]`: page 1 of the collection listing. Pages 2+ live under /page/[n]. */
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const sort = parseSort((await searchParams).sort);
  return <CollectionListingPage slug={slug} page={1} sort={sort} />;
}
