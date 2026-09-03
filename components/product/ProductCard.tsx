import Image from "next/image";
import Link from "next/link";
import { blurPlaceholder } from "@/lib/images";
import type { ProductCardModel } from "@/lib/products";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: ProductCardModel;
  /** Above-the-fold cards (first grid row) load eagerly with high fetch priority. */
  priority?: boolean;
  /** 1-based position in its grid, shown as a mono index in the media corner. */
  index?: number;
};

/**
 * Product card — ONE fluid component for every breakpoint.
 * Figma has "Product Card" (24:18) and "Product Card / Mobile" (63:73) only because Figma
 * cannot lock an aspect ratio; here the media area is `aspect-ratio: 1` with the artwork
 * contained on bg/subtle. Hover: border/subtle → border/default, no lift, no shadow.
 */
export function ProductCard({ product, priority = false, index }: ProductCardProps) {
  const blur = product.imageUrl ? blurPlaceholder(product.imageUrl) : undefined;

  return (
    <Link href={product.href} className={styles.card}>
      <span className={styles.media}>
        {index !== undefined && (
          <span className={`type-label numeric ${styles.index}`} aria-hidden="true">
            {String(index).padStart(2, "0")}
          </span>
        )}
        {product.imageUrl && (
          <span className={styles.mediaInner}>
            {/* Decorative inside the link: the visible name already labels the target. */}
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 260px, 45vw"
              className={styles.image}
              priority={priority}
              placeholder={blur ? "blur" : "empty"}
              blurDataURL={blur}
            />
          </span>
        )}
      </span>
      <span className={styles.text}>
        <span className={`type-body-l ${styles.name}`}>{product.name}</span>
        {product.presentation && (
          <span className={`type-caption type-mono ${styles.presentation}`}>
            {product.presentation}
          </span>
        )}
        {product.priceLabel && (
          <span className={`type-h3 numeric ${styles.price}`}>{product.priceLabel}</span>
        )}
      </span>
    </Link>
  );
}
