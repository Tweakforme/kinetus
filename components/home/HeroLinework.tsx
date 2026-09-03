import styles from "./HeroLinework.module.css";

/**
 * Ghosted molecular linework behind the hero render — the exact vectors exported in
 * Phase 2 (public/decor), inlined so the stroke follows a colour token. Rendered at 5%
 * opacity and eased in with a short drift on load; static under reduced motion.
 */
export function HeroLinework() {
  return (
    <div className={styles.linework} aria-hidden="true">
      <svg
        className={styles.hex}
        viewBox="0 0 201.5 301.749"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path
          d="M100.75 0.874643L150.75 30.8746V90.8746L100.75 120.875L50.75 90.8746V30.8746L100.75 0.874643Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M150.75 90.8746L200.75 120.875V180.875L150.75 210.875L100.75 180.875V120.875"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M50.75 90.8746L0.75 120.875V180.875L50.75 210.875L100.75 180.875"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M50.75 210.875V270.875L100.75 300.875L150.75 270.875V210.875"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        className={styles.nodes}
        viewBox="0 0 208 308"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <circle cx="104" cy="4" r="4" />
        <circle cx="154" cy="34" r="4" />
        <circle cx="54" cy="34" r="4" />
        <circle cx="204" cy="124" r="4" />
        <circle cx="4" cy="124" r="4" />
        <circle cx="104" cy="304" r="4" />
      </svg>
    </div>
  );
}
