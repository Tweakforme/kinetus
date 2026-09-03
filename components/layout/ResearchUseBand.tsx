import { Container } from "./Container";
import { RESEARCH_USE_COPY } from "@/lib/site";
import styles from "./ResearchUseBand.module.css";

/**
 * Persistent research-use band, rendered in the root layout directly above the footer.
 * Placement: both the approved Figma Homepage frames (43:126 desktop / 65:323 mobile)
 * and the client-confirmed deck put a full-bleed deep-teal notice band at the bottom of
 * the page, above the footer. Copy is the client's exact packaging wording.
 */
export function ResearchUseBand() {
  return (
    <section className={styles.band} aria-label="Research use notice">
      <Container>
        <p className={`type-h3 ${styles.statement}`}>{RESEARCH_USE_COPY}</p>
      </Container>
      <div className={styles.decor} aria-hidden="true">
        <span className={styles.decorHex} />
        <span className={styles.decorNodes} />
      </div>
    </section>
  );
}
