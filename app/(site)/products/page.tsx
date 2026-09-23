import type { Metadata } from "next";
import {
  ProductsListingPage,
  productsListingMetadata,
} from "@/components/collection/ProductsListingPage";
import { parseSort } from "@/lib/sort";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Rendered per request because of `?sort=`; the catalogue queries stay in the data cache
// (lib/cache.ts), so the database is only read after an admin save. The canonical never
// carries the sort.

export const metadata: Metadata = productsListingMetadata(1);

/** `/products`: page 1 of the canonical full listing. Pages 2+ live under /page/[n]. */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sort = parseSort((await searchParams).sort);
  return <ProductsListingPage page={1} sort={sort} />;
}
