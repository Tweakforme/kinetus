import Link from "next/link";
import type { CollectionSummary } from "@/lib/collections";
import styles from "./CollectionCard.module.css";

type CollectionCardProps = {
  collection: CollectionSummary;
};

/**
 * Collection card — Figma Collection Card (40:57): bg/base, border/subtle → border/default
 * on hover, radius/md, padding space-4; name H3, description Body S, "View collection"
 * label in brand/teal. The Figma image area is omitted: Collection has no image field and
 * imagery must not be fabricated, so the card is text-led.
 */
export function CollectionCard({ collection }: CollectionCardProps) {
  const count = collection.productCount;
  const countLabel = `${count} ${count === 1 ? "product" : "products"}`;

  return (
    <Link href={`/collections/${collection.slug}`} className={styles.card}>
      <span className={styles.text}>
        <span className={`type-h3 ${styles.name}`}>{collection.name}</span>
        {collection.description && (
          <span className={`type-body-s ${styles.description}`}>{collection.description}</span>
        )}
        <span className={`type-caption numeric ${styles.count}`}>{countLabel}</span>
      </span>
      <span className={`type-label ${styles.cta}`}>View collection</span>
    </Link>
  );
}
