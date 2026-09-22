import type { Metadata } from "next";
import {
  ProductsListingPage,
  productsListingMetadata,
} from "@/components/collection/ProductsListingPage";

/** Hourly regeneration, matching the product and collection pages. */
export const revalidate = 3600;

export const metadata: Metadata = productsListingMetadata(1);

/** `/products`: page 1 of the canonical full listing. Pages 2+ live under /page/[n]. */
export default function ProductsPage() {
  return <ProductsListingPage page={1} />;
}
