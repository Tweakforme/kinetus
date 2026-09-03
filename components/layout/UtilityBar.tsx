import Link from "next/link";
import { Container } from "./Container";
import { FlaskIcon } from "@/components/product/ProductIcons";
import { CONTACT_LINK, UTILITY_BAR_LINES } from "@/lib/site";
import styles from "./UtilityBar.module.css";

/**
 * Top utility bar — structure from the client-confirmed deck (flask icon, then the two
 * packaging strings; a single neutral Contact link on the right). Replaces the Phase 2
 * ResearchUseStrip. The deck's shipping and support items are not carried over.
 */
export function UtilityBar() {
  return (
    <div className={styles.bar}>
      <Container className={styles.row}>
        <p className={`type-label ${styles.notice}`}>
          <FlaskIcon className={styles.icon} />
          <span className={styles.line}>{UTILITY_BAR_LINES[0]}</span>
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
          <span className={styles.line}>{UTILITY_BAR_LINES[1]}</span>
        </p>
        <Link
          href={CONTACT_LINK.href}
          prefetch={CONTACT_LINK.prefetch === false ? false : undefined}
          className={`type-label ${styles.link}`}
        >
          {CONTACT_LINK.label}
        </Link>
      </Container>
    </div>
  );
}
