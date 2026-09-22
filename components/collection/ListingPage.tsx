import type { ReactNode } from "react";
import styles from "./ListingPage.module.css";

type ListingPageProps = {
  children: ReactNode;
  /** Adds top padding for pages that do not open with the full-bleed hero (search). */
  padTop?: boolean;
};

/**
 * Page wrapper for the listing routes. Block flow on purpose: the shared Container has
 * auto side margins and shrink-wraps inside a flex or grid parent (the trap hit in
 * Phases 2 and 3). Direct children are spaced by 40px (48px from 768px); a section that
 * needs more room adds its own padding.
 */
export function ListingPage({ children, padTop = false }: ListingPageProps) {
  return (
    <article className={padTop ? `${styles.page} ${styles.padTop}` : styles.page}>
      {children}
    </article>
  );
}
