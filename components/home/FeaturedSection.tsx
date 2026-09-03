import Link from "next/link";
import { ProductGrid } from "@/components/collection/ProductGrid";
import { Container } from "@/components/layout/Container";
import type { ProductCardModel } from "@/lib/products";
import { ALL_COLLECTIONS_LINK, ALL_PRODUCTS_LINK } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import buttons from "./buttons.module.css";
import styles from "./FeaturedSection.module.css";

type FeaturedSectionProps = {
  products: ProductCardModel[];
};

/**
 * Featured products — Figma 42:60 / 58:30: heading, the shared ProductGrid (4 / 2
 * columns), then a tertiary "View all products" link. Block flow between the three
 * blocks so the grid's Container is never a flex child (shrink-wrap trap).
 */
export function FeaturedSection({ products }: FeaturedSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="home-featured-heading">
      <Container data-reveal="">
        <SectionHeading id="home-featured-heading" eyebrow="Featured" title="Featured products" />
      </Container>

      <ProductGrid
        products={products}
        label="Featured products"
        hideCount
        emptyMessage="No products are published yet."
        emptyLink={ALL_COLLECTIONS_LINK}
      />

      <Container className={styles.actions} data-reveal="">
        <Link href={ALL_PRODUCTS_LINK.href} className={`type-label ${buttons.tertiary}`}>
          {ALL_PRODUCTS_LINK.label}
        </Link>
      </Container>
    </section>
  );
}
