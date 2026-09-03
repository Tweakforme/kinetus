import { CollectionCard } from "@/components/collection/CollectionCard";
import { Container } from "@/components/layout/Container";
import type { CollectionSummary } from "@/lib/collections";
import { SectionHeading } from "./SectionHeading";
import styles from "./CollectionsSection.module.css";

type CollectionsSectionProps = {
  collections: CollectionSummary[];
};

/**
 * Collections — Figma 41:45 (3 × 392px cards, space-8 gaps) / 58:6 (stacked).
 * Reuses CollectionCard (text-led: Collection carries no image, so there is nothing to
 * mark priority). Omitted entirely when no collection is published.
 */
export function CollectionsSection({ collections }: CollectionsSectionProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <Container
      as="section"
      className={styles.section}
      aria-labelledby="home-collections-heading"
      data-reveal=""
    >
      <SectionHeading id="home-collections-heading" eyebrow="Catalogue" title="Collections" />
      <ul className={styles.grid}>
        {collections.map((collection) => (
          <li key={collection.id} className={styles.item} data-reveal="">
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
