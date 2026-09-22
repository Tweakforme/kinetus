import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ClipboardCheckIcon,
  HexagonIcon,
  MicroscopeIcon,
  ShieldCheckIcon,
} from "@/components/icons/LineIcons";
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
 * The four micro-badges of the deck's product card (slide 7) with the client's packaging
 * strings in place of "HPLC TESTED" and "LC-MS VERIFIED".
 */
const BADGES = [
  { Icon: ShieldCheckIcon, label: ["THIRD-PARTY", "TESTED"] },
  { Icon: MicroscopeIcon, label: ["LAB VERIFIED", "PURITY & POTENCY"] },
  { Icon: ClipboardCheckIcon, label: ["BATCH-SPECIFIC", "COA AVAILABLE"] },
  { Icon: HexagonIcon, label: ["RESEARCH GRADE", "MATERIAL"] },
] as const;

/**
 * Deck product card (slide 7): landscape media with box and vial, uppercase name,
 * "10 mg · Lyophilized powder" subline, hairline, four micro-badges with tiny line icons,
 * large bold price with "CAD / VIAL" beside it, and "VIEW PRODUCT →". One fluid card.
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

        <span className={styles.badges} aria-label="Packaging statements">
          {BADGES.map(({ Icon, label }) => (
            <span key={label.join(" ")} className={styles.badge}>
              <Icon size={22} className={styles.badgeIcon} />
              <span className={styles.badgeLabel}>
                {label[0]}
                <br />
                {label[1]}
              </span>
            </span>
          ))}
        </span>

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
