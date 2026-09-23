import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProductsListingPage,
  productsListingMetadata,
} from "@/components/collection/ProductsListingPage";
import { parsePageParam } from "@/lib/catalogue";
import { parseSort } from "@/lib/sort";

type ProductsPagedProps = {
  params: Promise<{ n: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Rendered per request like the base /products route (`?sort=`), from the data cache.

export async function generateMetadata({ params }: ProductsPagedProps): Promise<Metadata> {
  const page = parsePageParam((await params).n);
  return page === null ? {} : productsListingMetadata(page);
}

/**
 * `/products/page/[n]` for n >= 2. Anything that is not a whole number from 2 up, or that
 * lies past the last page, is a 404; page 1 is only ever /products.
 */
export default async function ProductsPagedPage({ params, searchParams }: ProductsPagedProps) {
  const page = parsePageParam((await params).n);
  if (page === null) {
    notFound();
  }
  const sort = parseSort((await searchParams).sort);
  return <ProductsListingPage page={page} sort={sort} />;
}
