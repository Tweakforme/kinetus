import styles from "./SectionRule.module.css";

type SectionRuleProps = {
  /**
   * For full-bleed parents (a band spanning the viewport) rather than a Container: the
   * rule then aligns to the container's content edge from the parent's own left edge.
   */
  bleed?: boolean;
};

/**
 * Vertical hairline that connects a section to the one above it, down the left edge of
 * the content column. It spans the section gap and draws itself top to bottom when the
 * section reveals (see `.draw-rule` in globals.css). The parent must be
 * `position: relative` and must not clip its overflow.
 */
export function SectionRule({ bleed = false }: SectionRuleProps) {
  const className = bleed ? `${styles.rule} ${styles.bleed}` : styles.rule;
  return (
    <svg className={`draw-rule ${className}`} aria-hidden="true" focusable="false">
      <line x1="0.5" y1="0" x2="0.5" y2="100%" pathLength="1" />
    </svg>
  );
}
