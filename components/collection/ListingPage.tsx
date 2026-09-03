import type { ReactNode } from "react";
import styles from "./ListingPage.module.css";

type ListingPageProps = {
  children: ReactNode;
};

/**
 * Page wrapper for the listing routes. Block flow on purpose: the shared Container has
 * auto side margins and shrink-wraps inside a flex or grid parent (the trap hit in
 * Phases 2 and 3). Section rhythm is applied as margins.
 */
export function ListingPage({ children }: ListingPageProps) {
  return <article className={styles.page}>{children}</article>;
}
