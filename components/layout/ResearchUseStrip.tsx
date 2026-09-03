import { Fragment } from "react";
import { Container } from "./Container";
import { RESEARCH_USE_COPY_LINES } from "@/lib/site";
import styles from "./ResearchUseStrip.module.css";

/**
 * Slim utility strip above the main header row, carrying the research-use
 * disclaimer. Structure comes from the client-confirmed PowerPoint deck (every
 * page header shows a dark top strip with the research-use notice). Styled with
 * the approved Figma tokens. The deck's promotional/support items in the same
 * strip are intentionally not carried over.
 */
export function ResearchUseStrip() {
  return (
    <div className={styles.strip}>
      <Container>
        <p className={`type-label ${styles.text}`}>
          {RESEARCH_USE_COPY_LINES.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? " " : null}
              <span className={styles.line}>{line}</span>
            </Fragment>
          ))}
        </p>
      </Container>
    </div>
  );
}
