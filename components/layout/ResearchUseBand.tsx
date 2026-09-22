import { Fragment } from "react";
import { FlaskIcon } from "@/components/icons/LineIcons";
import { Container } from "./Container";
import { RESEARCH_USE_COPY_LINES } from "@/lib/site";
import styles from "./ResearchUseBand.module.css";

/**
 * Persistent research-use band, rendered in the root layout directly above the footer:
 * a teal gradient strip with a centred flask icon and the client's exact packaging
 * wording in white condensed uppercase.
 */
export function ResearchUseBand() {
  return (
    <section className={styles.band} aria-label="Research use notice">
      <Container className={styles.inner}>
        <FlaskIcon size={28} className={styles.icon} />
        <p className={styles.statement}>
          {RESEARCH_USE_COPY_LINES.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? " " : null}
              <span className={styles.line}>{line}</span>
            </Fragment>
          ))}
        </p>
      </Container>
    </section>
  );
}
