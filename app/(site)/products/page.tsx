import type { Metadata } from "next";
import {
  ProductsListingPage,
  productsListingMetadata,
} from "@/components/collection/ProductsListingPage";

// Statically generated; regenerated when an admin save expires the product tags, or when
// a listed product's scheduled sale starts or ends (lib/cache.ts).

export const metadata: Metadata = productsListingMetadata(1);

/** `/products`: page 1 of the canonical full listing. Pages 2+ live under /page/[n]. */
export default function ProductsPage() {
  return <ProductsListingPage page={1} />;
}
