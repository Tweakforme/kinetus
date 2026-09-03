import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { NavLink } from "@/lib/site";
import styles from "./CollectionLinks.module.css";

type CollectionLinksProps = {
  /** Label-style eyebrow above the links, e.g. "Other collections". */
  heading: string;
  links: NavLink[];
  headingId: string;
};

/**
 * Row of tertiary link buttons to collection pages — the deck's classification bar
 * executed as the Figma tertiary button (5:36). Renders nothing when there are no links.
 */
export function CollectionLinks({ heading, links, headingId }: CollectionLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <Container as="section" className={styles.section} aria-labelledby={headingId} data-reveal="">
      <p id={headingId} className={`type-label ${styles.heading}`}>
        {heading}
      </p>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={link.prefetch === false ? false : undefined}
              className={`type-label ${styles.link}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
