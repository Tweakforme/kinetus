import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { canonicalUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

/**
 * Phase 2 placeholder home. Explicitly NOT the real homepage — that is Phase 5.
 * It exists only so the deployed shell (header, research-use band, footer) has
 * something to wrap.
 */
export default function Home() {
  return (
    <Container>
      <div className={styles.placeholder}>
        <p className={`type-label ${styles.eyebrow}`}>Site in development</p>
        <h1 className="type-h1">{SITE_NAME}</h1>
      </div>
    </Container>
  );
}
