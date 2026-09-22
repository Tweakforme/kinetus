import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionDivider } from "@/components/ui/SectionDivider";
import buttons from "@/components/ui/buttons.module.css";
import type { ProductCardModel } from "@/lib/products";
import { ALL_PRODUCTS_LINK } from "@/lib/site";
import styles from "./FeaturedGrid.module.css";

type FeaturedGridProps = {
  products: ProductCardModel[];
};

/** The first desktop row (four columns) loads its renders eagerly. */
const PRIORITY_COUNT = 4;

/**
 * "FEATURED MATERIALS" divider, the featured ProductCard grid (four columns from 1024px,
 * two below) and a centred solid "VIEW ALL PRODUCTS" button. Block flow inside one
 * Container so the shared Container never sits in a flex or grid parent.
 */
export function FeaturedGrid({ products }: FeaturedGridProps) {
  return (
    <Container
      as="section"
      className={styles.section}
      aria-labelledby="home-featured-heading"
      data-reveal=""
    >
      <SectionDivider id="home-featured-heading" title="Featured materials" />

      {products.length > 0 ? (
        <ul className={styles.grid}>
          {products.map((product, index) => (
            <li key={product.id} className={styles.item} data-reveal="">
              <ProductCard product={product} priority={index < PRIORITY_COUNT} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No products are published yet.</p>
      )}

      <div className={styles.actions}>
        <Link href={ALL_PRODUCTS_LINK.href} className={buttons.solid}>
          {ALL_PRODUCTS_LINK.label}
        </Link>
      </div>
    </Container>
  );
}
