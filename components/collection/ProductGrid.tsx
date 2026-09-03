import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardModel } from "@/lib/products";
import type { NavLink } from "@/lib/site";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  products: ProductCardModel[];
  /** Accessible name for the section, e.g. the collection name. */
  label: string;
  /** Shown instead of the grid when there is nothing published. */
  emptyMessage: string;
  emptyLink: NavLink;
  /** Omit the "Showing N products" line (homepage featured grid). */
  hideCount?: boolean;
};

/** "Showing 1 product" / "Showing 12 products" — Figma results bar (51:102). */
export function resultCountLabel(count: number): string {
  return `Showing ${count} ${count === 1 ? "product" : "products"}`;
}

/** Cards in the first desktop row load eagerly (4 columns at 1240px). */
const FIRST_ROW_SIZE = 4;

/**
 * Result count + product grid, reusing the single ProductCard. 4 columns on desktop
 * (292px cards, 24px column / 32px row gaps), 2 columns on mobile (Figma 51:108 / 67:91).
 * The Figma results bar also shows a static sort control; sorting is out of scope.
 */
export function ProductGrid({
  products,
  label,
  emptyMessage,
  emptyLink,
  hideCount = false,
}: ProductGridProps) {
  return (
    <Container as="section" className={styles.section} aria-label={label} data-reveal="">
      {!hideCount && (
        <p className={`type-body-s numeric ${styles.count}`}>{resultCountLabel(products.length)}</p>
      )}

      {products.length > 0 ? (
        <ul className={styles.grid}>
          {products.map((product, index) => (
            <li key={product.id} className={styles.item} data-reveal="">
              <ProductCard product={product} priority={index < FIRST_ROW_SIZE} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={`type-body ${styles.emptyText}`}>{emptyMessage}</p>
          <Link href={emptyLink.href} className={`type-label ${styles.emptyLink}`}>
            {emptyLink.label}
          </Link>
        </div>
      )}
    </Container>
  );
}
