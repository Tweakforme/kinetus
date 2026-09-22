import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProductsListingPage,
  productsListingMetadata,
} from "@/components/collection/ProductsListingPage";
import { pageCount, parsePageParam } from "@/lib/catalogue";
import { getProductCount } from "@/lib/products";

type ProductsPagedProps = {
  params: Promise<{ n: string }>;
};

/** Matches the base /products route. */
export const revalidate = 3600;

/** Every page from 2 up to the last page of the full listing. */
export async function generateStaticParams() {
  const total = pageCount(await getProductCount());
  return Array.from({ length: Math.max(0, total - 1) }, (_, index) => ({
    n: String(index + 2),
  }));
}

export async function generateMetadata({ params }: ProductsPagedProps): Promise<Metadata> {
  const page = parsePageParam((await params).n);
  return page === null ? {} : productsListingMetadata(page);
}

/**
 * `/products/page/[n]` for n >= 2. Anything that is not a whole number from 2 up, or that
 * lies past the last page, is a 404; page 1 is only ever /products.
 */
export default async function ProductsPagedPage({ params }: ProductsPagedProps) {
  const page = parsePageParam((await params).n);
  if (page === null) {
    notFound();
  }
  return <ProductsListingPage page={page} />;
}
