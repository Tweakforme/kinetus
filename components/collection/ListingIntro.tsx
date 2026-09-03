import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import styles from "./ListingIntro.module.css";

type ListingIntroProps = {
  /** Optional breadcrumb rendered above the copy (collection pages). */
  breadcrumb?: ReactNode;
  /** Label-style eyebrow, e.g. "Collection". */
  eyebrow: string;
  title: string;
  /** Intro paragraph at the canonical 580px measure. */
  intro?: string | null;
};

/**
 * Listing intro — Figma 50:117 (desktop) / 67:66 (mobile): breadcrumb, eyebrow, H1,
 * intro paragraph, then the diamond rule divider (1px border/default rules either side
 * of a 12px brand/teal diamond, exact vector from node 50:131).
 */
export function ListingIntro({ breadcrumb, eyebrow, title, intro }: ListingIntroProps) {
  return (
    <Container className={styles.intro} data-reveal="">
      {breadcrumb}

      <div className={styles.copy}>
        <p className={`type-label ${styles.eyebrow}`}>{eyebrow}</p>
        <h1 className={`type-h1 ${styles.title}`}>{title}</h1>
        {intro && <p className={`type-body ${styles.paragraph}`}>{intro}</p>}
      </div>

      <div className={styles.divider} aria-hidden="true">
        <span className={styles.rule} />
        <svg
          className={styles.diamond}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
        >
          <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="currentColor" />
        </svg>
        <span className={styles.rule} />
      </div>
    </Container>
  );
}
