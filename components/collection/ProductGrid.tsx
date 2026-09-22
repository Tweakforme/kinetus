import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardModel } from "@/lib/products";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  products: ProductCardModel[];
  /** Accessible name for the list, e.g. the collection name. */
  label: string;
  /** How many leading cards load eagerly (the first desktop row by default). */
  priorityCount?: number;
  className?: string;
};

/**
 * The deck's card grid (slide 7): 4 columns from 1024px, 3 from 768px, 2 below, 20px
 * gaps. A bare list, so the caller places it inside its own Container next to the
 * divider and results line. Renders nothing for an empty list; the caller owns the
 * empty state.
 */
export function ProductGrid({ products, label, priorityCount = 4, className }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <ul className={className ? `${styles.grid} ${className}` : styles.grid} aria-label={label}>
      {products.map((product, index) => (
        <li key={product.id} className={styles.item} data-reveal="">
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
