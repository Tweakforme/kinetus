import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CollectionListingPage,
  collectionListingMetadata,
} from "@/components/collection/CollectionListingPage";
import { parsePageQuery } from "@/lib/catalogue";
import { parseSort } from "@/lib/sort";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Rendered per request because of `?page=` and `?sort=`; the collection queries stay in
// the data cache (lib/cache.ts), so the database is only read after an admin save. Each
// page's canonical is its own `?page=` URL, never with the sort.

export async function generateMetadata({
  params,
  searchParams,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = parsePageQuery((await searchParams).page);
  return page === null ? {} : collectionListingMetadata(slug, page);
}

/** `/collections/[slug]?page=N`: the collection listing, 20 products per page. */
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = parsePageQuery(query.page);
  if (page === null) {
    notFound();
  }
  return <CollectionListingPage slug={slug} page={page} sort={parseSort(query.sort)} />;
}
