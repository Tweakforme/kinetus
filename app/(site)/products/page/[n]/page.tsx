import { notFound, permanentRedirect } from "next/navigation";
import { pageHref, parsePageParam } from "@/lib/catalogue";
import { ALL_PRODUCTS_LINK } from "@/lib/site";
import { parseSort, withSort } from "@/lib/sort";

type ProductsPagedProps = {
  params: Promise<{ n: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Old `/products/page/[n]` URLs: listings now page with `?page=`, so these redirect
 * permanently to `/products?page=n` (keeping `?sort=`). Anything else is a 404.
 */
export default async function ProductsPagedPage({ params, searchParams }: ProductsPagedProps) {
  const page = parsePageParam((await params).n);
  if (page === null) {
    notFound();
  }
  const sort = parseSort((await searchParams).sort);
  permanentRedirect(withSort(pageHref(ALL_PRODUCTS_LINK.href, page), sort));
}
