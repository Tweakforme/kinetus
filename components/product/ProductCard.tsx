import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/LineIcons";
import buttons from "@/components/ui/buttons.module.css";
import { blurPlaceholder } from "@/lib/images";
import type { ProductCardModel } from "@/lib/products";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: ProductCardModel;
  /** Above-the-fold cards load eagerly. */
  priority?: boolean;
};

/**
 * Deck product card (slide 7): landscape media with box and vial, uppercase name,
 * "10 mg · Lyophilized powder" subline, hairline, large bold price with "CAD / VIAL"
 * beside it, and "VIEW PRODUCT →". One fluid card. The deck's four micro-badges are not
 * shown, at the client's request.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const blur = product.imageUrl ? blurPlaceholder(product.imageUrl) : undefined;

  return (
    <Link href={product.href} className={styles.card}>
      <span className={styles.media}>
        {product.imageUrl && (
          // Decorative inside the link: the visible name already labels the target.
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 40vw, 45vw"
            className={styles.image}
            priority={priority}
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
          />
        )}
      </span>

      <span className={styles.body}>
        <span className={styles.name}>{product.name}</span>
        {product.subline && <span className={styles.subline}>{product.subline}</span>}

        <span className={styles.rule} aria-hidden="true" />

        {product.priceLabel && (
          <span className={styles.priceRow}>
            {product.fromPrice && <span className={styles.from}>From</span>}
            <span className={`numeric ${styles.price}`}>{product.priceLabel}</span>
            <span className={styles.unit}>CAD / VIAL</span>
          </span>
        )}

        <span className={`${buttons.link} ${buttons.linkTeal} ${styles.cta}`}>
          View product
          <ArrowRightIcon size={18} />
        </span>
      </span>
    </Link>
  );
}
