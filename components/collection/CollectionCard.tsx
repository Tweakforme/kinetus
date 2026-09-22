import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, DocumentIcon } from "@/components/icons/LineIcons";
import buttons from "@/components/ui/buttons.module.css";
import type { CollectionSummary } from "@/lib/collections";
import { blurPlaceholder } from "@/lib/images";
import { COLLECTION_SLUGS, collectionHref } from "@/lib/site";
import { LISTING_RENDER } from "./listingAssets";
import styles from "./CollectionCard.module.css";

type CollectionCardProps = {
  collection: CollectionSummary;
  /** Above-the-fold cards load their render eagerly. */
  priority?: boolean;
};

/**
 * Large category card for the /collections hub (the homepage category card, slide 4,
 * at hub scale): the blank product render left, royal-blue uppercase name, description,
 * published count and "VIEW ALL" right. Research shows a document icon instead of a
 * render, since no document imagery may be fabricated.
 */
export function CollectionCard({ collection, priority = false }: CollectionCardProps) {
  const isResearch = collection.slug === COLLECTION_SLUGS.research;
  const count = collection.productCount;
  const countLabel =
    count > 0
      ? `${count} ${count === 1 ? "product" : "products"}`
      : isResearch
        ? "Documentation and batch references"
        : "No products published yet";
  const blur = blurPlaceholder(LISTING_RENDER.src);

  return (
    <Link href={collectionHref(collection.slug)} className={styles.card}>
      <span className={styles.media}>
        {isResearch ? (
          <DocumentIcon size={72} className={styles.icon} />
        ) : (
          // Decorative inside the link: the visible name already labels the target.
          <Image
            src={LISTING_RENDER.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 768px) 36vw, 42vw"
            className={styles.image}
            priority={priority}
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
          />
        )}
      </span>

      <span className={styles.body}>
        <span className={styles.name}>{collection.name}</span>
        {collection.description && (
          <span className={styles.description}>{collection.description}</span>
        )}
        <span className={`numeric ${styles.count}`}>{countLabel}</span>
        <span className={`${buttons.link} ${styles.cta}`}>
          {isResearch ? "View resources" : "View all"}
          <ArrowRightIcon size={18} />
        </span>
      </span>
    </Link>
  );
}
