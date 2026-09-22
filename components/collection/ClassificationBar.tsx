import Link from "next/link";
import buttons from "@/components/ui/buttons.module.css";
import { ALL_PRODUCTS_LINK, COLLECTION_SLUGS, collectionHref } from "@/lib/site";
import styles from "./ClassificationBar.module.css";

/** The deck's classification pills (slide 5) mapped onto the catalogue's real ranges. */
export const CLASSIFICATION_PILLS = [
  { label: "All Products", href: ALL_PRODUCTS_LINK.href },
  { label: "Peptides", href: collectionHref(COLLECTION_SLUGS.peptides) },
  { label: "Blends", href: collectionHref(COLLECTION_SLUGS.blends) },
  { label: "Lab Supplies", href: collectionHref(COLLECTION_SLUGS.labSupplies) },
  { label: "Research", href: collectionHref(COLLECTION_SLUGS.research) },
] as const;

type ClassificationBarProps = {
  /** Href of the pill that reads as current; omit for none (search). */
  activeHref?: string;
  /** Accessible name for the navigation region. */
  label?: string;
  className?: string;
};

/**
 * Row of navy pills linking the full listing and the four ranges; the current one is
 * filled teal and carries aria-current. Wraps onto two rows at 390px so nothing scrolls.
 */
export function ClassificationBar({
  activeHref,
  label = "Catalogue ranges",
  className,
}: ClassificationBarProps) {
  return (
    <nav className={className ? `${styles.bar} ${className}` : styles.bar} aria-label={label}>
      <ul className={styles.list}>
        {CLASSIFICATION_PILLS.map((pill) => {
          const active = pill.href === activeHref;
          return (
            <li key={pill.href}>
              <Link
                href={pill.href}
                className={active ? `${buttons.pill} ${buttons.pillActive}` : buttons.pill}
                aria-current={active ? "page" : undefined}
              >
                {pill.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
