import { notFound, permanentRedirect } from "next/navigation";
import { pageHref, parsePageParam } from "@/lib/catalogue";
import { collectionHref } from "@/lib/site";
import { parseSort, withSort } from "@/lib/sort";

type CollectionPagedProps = {
  params: Promise<{ slug: string; n: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Old `/collections/[slug]/page/[n]` URLs: listings now page with `?page=`, so these
 * redirect permanently to `/collections/[slug]?page=n` (keeping `?sort=`). Anything else
 * is a 404.
 */
export default async function CollectionPagedPage({ params, searchParams }: CollectionPagedProps) {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  if (page === null) {
    notFound();
  }
  const sort = parseSort((await searchParams).sort);
  permanentRedirect(withSort(pageHref(collectionHref(slug), page), sort));
}
