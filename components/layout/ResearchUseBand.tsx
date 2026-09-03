import { Fragment } from "react";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { Container } from "./Container";
import { RESEARCH_USE_COPY_LINES } from "@/lib/site";
import styles from "./ResearchUseBand.module.css";

/**
 * Persistent research-use band, rendered in the root layout directly above the footer.
 * Placement: both the approved Figma Homepage frames (43:126 desktop / 65:323 mobile)
 * and the client-confirmed deck put a full-bleed deep-teal notice band at the bottom of
 * the page, above the footer. Copy is the client's exact packaging wording. The frame's
 * ghosted molecular linework is not reproduced here (Phase 6: one hexagon field per page,
 * in the hero only); the band carries registration marks instead.
 */
export function ResearchUseBand() {
  return (
    <section className={styles.band} aria-label="Research use notice">
      <Container>
        <div className={styles.frame}>
          <RegistrationMarks />
          <p className={`type-h3 ${styles.statement}`}>
            {RESEARCH_USE_COPY_LINES.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? " " : null}
                <span className={styles.line}>{line}</span>
              </Fragment>
            ))}
          </p>
        </div>
      </Container>
    </section>
  );
}
