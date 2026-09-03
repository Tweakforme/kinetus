import styles from "./DiamondRule.module.css";

/**
 * Section divider: hairline rules on border/default either side of the 12px brand/teal
 * diamond node from the approved system (exact vector, Figma node 50:131).
 */
export function DiamondRule() {
  return (
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
  );
}
