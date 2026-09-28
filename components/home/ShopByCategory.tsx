import { CollectionKind } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon, FlaskIcon, HexagonIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { getAllCollections } from "@/lib/collections";
import { ALL_PRODUCTS_LINK, collectionHref } from "@/lib/site";
import styles from "./ShopByCategory.module.css";

type ShopByCategoryProps = {
  headingId: string;
  /** h1 on /research, h2 on the homepage. */
  as?: "h1" | "h2";
  /** Divider title; /research uses its own mockup's "Research Material Categories". */
  title?: string;
  /** Optional text under the divider (the /research intro). */
  intro?: ReactNode;
  /**
   * The closing "Shop all products" card. The homepage leaves it out: its SHOP ALL
   * PRODUCTS bar, just above this section, carries the same link and wording.
   */
  showAllProducts?: boolean;
};

/**
 * "Shop by Category" (the client's Shop by Category mockup): one card per published
 * CATEGORY collection, icon | hairline | name | chevron, three per row on desktop, then a
 * full-width "Shop all products" card (not on the homepage, see showAllProducts). Names,
 * order and icons come from the admin. The
 * mockup's "SCIENCE. PURITY. PERFORMANCE." and "ADVANCING RESEARCH. IMPROVING TOMORROW."
 * lines are not on the permitted list and are left out. Shared by the homepage and
 * /research.
 */
export async function ShopByCategory({
  headingId,
  as = "h2",
  title = "Shop by Category",
  intro,
  showAllProducts = true,
}: ShopByCategoryProps) {
  const categories = await getAllCollections(CollectionKind.CATEGORY);
  if (categories.length === 0) {
    return null;
  }

  return (
    <Container as="section" className={styles.section} aria-labelledby={headingId} data-reveal="">
      <SectionDivider id={headingId} as={as} title={title} nodes />
      {intro && <div className={styles.intro}>{intro}</div>}

      <ul className={styles.grid}>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href={collectionHref(category.slug)} className={styles.card}>
              <span className={styles.icon}>
                {category.iconUrl ? (
                  // Decorative: the name beside it labels the link.
                  <Image
                    src={category.iconUrl}
                    alt=""
                    width={72}
                    height={72}
                    sizes="72px"
                    className={styles.iconImage}
                  />
                ) : (
                  <HexagonIcon size={48} className={styles.iconFallback} />
                )}
              </span>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.name}>{category.name}</span>
              <span className={styles.chevron} aria-hidden="true">
                <ChevronRightIcon size={20} />
              </span>
            </Link>
          </li>
        ))}
        {showAllProducts && (
          <li className={styles.wide}>
            <Link href={ALL_PRODUCTS_LINK.href} className={`${styles.card} ${styles.allCard}`}>
              <span className={styles.icon}>
                <FlaskIcon size={48} className={styles.iconFallback} />
              </span>
              <span className={styles.rule} aria-hidden="true" />
              <span className={styles.allText}>
                <span className={styles.name}>Shop all products</span>
                <span className={styles.allSub}>Explore the complete research catalogue</span>
              </span>
              <span className={styles.chevron} aria-hidden="true">
                <ChevronRightIcon size={20} />
              </span>
            </Link>
          </li>
        )}
      </ul>
    </Container>
  );
}
