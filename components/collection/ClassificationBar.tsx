import Link from "next/link";
import buttons from "@/components/ui/buttons.module.css";
import { getCatalogueLinks } from "@/lib/navigation";
import styles from "./ClassificationBar.module.css";

type ClassificationBarProps = {
  /** Href of the pill that reads as current; omit for none (search). */
  activeHref?: string;
  /** Accessible name for the navigation region. */
  label?: string;
  className?: string;
};

/**
 * The deck's classification pills (slide 5): the full listing and each published range,
 * from the catalogue (lib/navigation.ts), so a renamed or unpublished range follows. Row
 * of navy pills; the current one is
 * filled teal and carries aria-current. Wraps onto two rows at 390px so nothing scrolls.
 */
export async function ClassificationBar({
  activeHref,
  label = "Catalogue ranges",
  className,
}: ClassificationBarProps) {
  const pills = await getCatalogueLinks();
  return (
    <nav className={className ? `${styles.bar} ${className}` : styles.bar} aria-label={label}>
      <ul className={styles.list}>
        {pills.map((pill) => {
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
