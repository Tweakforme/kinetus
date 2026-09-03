import Image from "next/image";
import Link from "next/link";
import type { ProductCardModel } from "@/lib/products";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: ProductCardModel;
};

/**
 * Product card — ONE fluid component for every breakpoint.
 * Figma has "Product Card" (24:18) and "Product Card / Mobile" (63:73) only because Figma
 * cannot lock an aspect ratio; here the media area is `aspect-ratio: 1` with the artwork
 * contained on bg/subtle. Hover: border/subtle → border/default, no lift, no shadow.
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={product.href} className={styles.card}>
      <span className={styles.media}>
        {product.imageUrl && (
          <span className={styles.mediaInner}>
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 768px) 260px, 45vw"
              className={styles.image}
            />
          </span>
        )}
      </span>
      <span className={styles.text}>
        <span className={`type-body-l ${styles.name}`}>{product.name}</span>
        {product.presentation && (
          <span className={`type-caption ${styles.presentation}`}>{product.presentation}</span>
        )}
        {product.priceLabel && (
          <span className={`type-h3 ${styles.price}`}>{product.priceLabel}</span>
        )}
      </span>
    </Link>
  );
}
