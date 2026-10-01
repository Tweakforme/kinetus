import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProductsListingPage,
  productsListingMetadata,
} from "@/components/collection/ProductsListingPage";
import { parsePageQuery } from "@/lib/catalogue";
import { parseSort } from "@/lib/sort";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Rendered per request because of `?page=` and `?sort=`; the catalogue queries stay in
// the data cache (lib/cache.ts), so the database is only read after an admin save. Each
// page's canonical is its own `?page=` URL, never with the sort.

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const page = parsePageQuery((await searchParams).page);
  return page === null ? {} : productsListingMetadata(page);
}

/** `/products?page=N`: the canonical full listing, 20 products per page. */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  const page = parsePageQuery(query.page);
  if (page === null) {
    notFound();
  }
  return <ProductsListingPage page={page} sort={parseSort(query.sort)} />;
}
