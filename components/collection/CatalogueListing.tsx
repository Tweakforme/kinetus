import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionDivider } from "@/components/ui/SectionDivider";
import type { ProductCardModel } from "@/lib/products";
import type { SortKey } from "@/lib/sort";
import { ClassificationBar } from "./ClassificationBar";
import { DocumentationSection } from "./DocumentationSection";
import { CATALOGUE_SECTION_ID, LISTING_RENDER, resultsLine } from "./listingAssets";
import { Pagination } from "./Pagination";
import { ProductGrid } from "./ProductGrid";
import { SortControl } from "./SortControl";
import styles from "./CatalogueListing.module.css";

export type CatalogueListingProps = {
  hero: {
    headline: ReactNode;
    headingId: string;
    paragraph: ReactNode;
    cta: { label: string; href: string };
    /** A photograph behind the hero in place of the render (Peptides and Blends). */
    backgroundImage?: string;
  };
  divider: {
    id: string;
    title: string;
    subtitle?: string;
    note?: ReactNode;
    nodes?: boolean;
  };
  /** Href of the pill that reads as current, e.g. "/products" or "/collections/peptides". */
  activeHref: string;
  /** Accessible name for the grid, e.g. the collection name. */
  label: string;
  /** The current page's cards only. */
  products: ProductCardModel[];
  page: number;
  totalPages: number;
  totalItems: number;
  /** Builds the href for a page number (1 is the base listing). */
  hrefFor: (page: number) => string;
  /** Line shown when the range has nothing published; omit where that is by design. */
  emptyMessage?: string;
  /** Force the batch documentation section (Research). Empty ranges always get it. */
  showDocumentation?: boolean;
  /** The listing's page 1 URL and the active `?sort=`; shows the sort control. */
  sort?: { base: string; current: SortKey | null };
};

/** Cards in the first desktop row load eagerly. */
const FIRST_ROW = 4;

/**
 * One layout for every catalogue listing (deck slides 7 and 12): the navy category hero,
 * the maple-leaf divider with its two subheadings, the classification pill bar, the
 * results line, the four-column card grid and centred pagination. An empty range shows
 * its message and the batch documentation section instead of the grid.
 */
export function CatalogueListing({
  hero,
  divider,
  activeHref,
  label,
  products,
  page,
  totalPages,
  totalItems,
  hrefFor,
  emptyMessage,
  showDocumentation = false,
  sort,
}: CatalogueListingProps) {
  const hasProducts = products.length > 0;

  return (
    <>
      <PageHero
        variant="category"
        headline={hero.headline}
        headingId={hero.headingId}
        paragraph={hero.paragraph}
        cta={hero.cta}
        image={hero.backgroundImage ? undefined : LISTING_RENDER}
        backgroundImage={hero.backgroundImage}
      />

      <Container
        as="section"
        id={CATALOGUE_SECTION_ID}
        className={styles.catalogue}
        aria-labelledby={divider.id}
        data-reveal=""
      >
        <SectionDivider
          id={divider.id}
          title={divider.title}
          subtitle={divider.subtitle}
          note={divider.note}
          nodes={divider.nodes}
        />

        <ClassificationBar activeHref={activeHref} className={styles.pills} />

        {hasProducts ? (
          <>
            <div className={styles.toolbar}>
              <p className={`type-caption numeric ${styles.results}`}>
                {resultsLine(page, totalItems)}
              </p>
              {sort && totalItems > 1 && <SortControl base={sort.base} current={sort.current} />}
            </div>
            <ProductGrid
              products={products}
              label={label}
              priorityCount={FIRST_ROW}
              className={styles.grid}
            />
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Pagination
                  current={page}
                  total={totalPages}
                  hrefFor={hrefFor}
                  label={`${label} pagination`}
                />
              </div>
            )}
          </>
        ) : emptyMessage ? (
          <p className={`type-body ${styles.empty}`}>{emptyMessage}</p>
        ) : null}
      </Container>

      {(showDocumentation || !hasProducts) && <DocumentationSection />}
    </>
  );
}
