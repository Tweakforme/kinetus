import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CollectionListingPage,
  collectionListingMetadata,
} from "@/components/collection/CollectionListingPage";
import { parsePageParam } from "@/lib/catalogue";
import { parseSort } from "@/lib/sort";

type CollectionPagedProps = {
  params: Promise<{ slug: string; n: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Rendered per request like the base collection route (`?sort=`), from the data cache.

export async function generateMetadata({ params }: CollectionPagedProps): Promise<Metadata> {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  return page === null ? {} : collectionListingMetadata(slug, page);
}

/**
 * `/collections/[slug]/page/[n]` for n >= 2. Anything that is not a whole number from 2
 * up, or that lies past the last page, is a 404; page 1 is only ever the base URL.
 */
export default async function CollectionPagedPage({ params, searchParams }: CollectionPagedProps) {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  if (page === null) {
    notFound();
  }
  const sort = parseSort((await searchParams).sort);
  return <CollectionListingPage slug={slug} page={page} sort={sort} />;
}
