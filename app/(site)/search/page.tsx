import type { Metadata } from "next";
import { ClassificationBar } from "@/components/collection/ClassificationBar";
import { ListingPage } from "@/components/collection/ListingPage";
import { ProductGrid } from "@/components/collection/ProductGrid";
import { SearchForm } from "@/components/collection/SearchForm";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { normaliseSearchQuery, searchProducts, toProductCardModel } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DESCRIPTION = `Search the ${SITE_NAME} catalogue by product name, size or SKU.`;

/** Quoted query for copy, e.g. “BPC”. */
function quoted(query: string): string {
  return `“${query}”`;
}

/** Request-time metadata; results pages are never indexed. */
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = normaliseSearchQuery((await searchParams).q);
  return {
    title: query ? `Search results for ${quoted(query)}` : "Search the catalogue",
    description: DESCRIPTION,
    robots: { index: false, follow: true },
  };
}

/**
 * /search?q=: a compact, hero-less page rendered at request time. The "Search Results"
 * divider, the search form, then either the results line and card grid or an empty
 * state pointing at the four ranges. Matches published product names, case-insensitively.
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = normaliseSearchQuery((await searchParams).q);
  const now = new Date();
  const rows = query ? await searchProducts(query) : [];
  const products = rows.map((product) => toProductCardModel(product, now));
  const count = products.length;

  return (
    <ListingPage padTop>
      <Container as="section" className={styles.section} aria-labelledby="search-heading">
        <SectionDivider id="search-heading" as="h1" title="Search Results" />

        <SearchForm query={query} />

        {query && count > 0 ? (
          <div className={styles.stack}>
            <p className={`type-caption numeric ${styles.results}`} aria-live="polite">
              {`Showing ${count} ${count === 1 ? "result" : "results"} for ${quoted(query)}`}
            </p>
            <ProductGrid products={products} label="Search results" />
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={`type-body ${styles.emptyText}`} aria-live="polite">
              {query
                ? `No products match ${quoted(query)}. Check the spelling, or browse the catalogue by range.`
                : "Enter a product name, size or SKU to search the catalogue, or browse by range."}
            </p>
            <ClassificationBar label="Browse by range" />
          </div>
        )}
      </Container>
    </ListingPage>
  );
}
