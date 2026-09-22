import type { ReactNode } from "react";
import { MapleLeafIcon } from "@/components/icons/LineIcons";
import styles from "./SectionDivider.module.css";

type SectionDividerProps = {
  id: string;
  title: string;
  /** Letterspaced uppercase line under the title (slide 12 "SCIENCE. PURITY. PERFORMANCE."). */
  subtitle?: string;
  /** Sentence-case blue line under the subtitle. */
  note?: ReactNode;
  /** Three connector nodes on the left rule (slide 4 "RESEARCH MATERIALS"). */
  nodes?: boolean;
  /** Heading level for the title (h2 by default). */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * The deck's section divider motif: centred uppercase condensed heading, horizontal rules
 * running to both edges, a red maple leaf flanking each side, and blue subheadings beneath.
 */
export function SectionDivider({
  id,
  title,
  subtitle,
  note,
  nodes = false,
  as: Heading = "h2",
  className,
}: SectionDividerProps) {
  return (
    <div className={className ? `${styles.divider} ${className}` : styles.divider}>
      <div className={styles.row}>
        <span className={styles.rule} aria-hidden="true">
          {nodes && (
            <span className={styles.nodes}>
              <span className={styles.node} />
              <span className={styles.node} />
              <span className={styles.node} />
            </span>
          )}
        </span>
        <MapleLeafIcon className={styles.leaf} size={26} />
        <Heading id={id} className={`type-section ${styles.title}`}>
          {title}
        </Heading>
        <MapleLeafIcon className={styles.leaf} size={26} />
        <span className={styles.rule} aria-hidden="true" />
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {note && <p className={styles.note}>{note}</p>}
    </div>
  );
}
