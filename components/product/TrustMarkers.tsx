import { FlaskIcon, HexagonIcon, ShieldCheckIcon } from "./ProductIcons";
import styles from "./TrustMarkers.module.css";

/**
 * Trust markers — Figma 27:26 (desktop) / 68:200 (mobile).
 * The three strings are verbatim from the client's packaging renders; do not reword.
 */
const MARKERS = [
  { label: "LAB VERIFIED PURITY & POTENCY", Icon: ShieldCheckIcon },
  { label: "THIRD-PARTY TESTED", Icon: FlaskIcon },
  { label: "RESEARCH GRADE MATERIAL", Icon: HexagonIcon },
] as const;

export function TrustMarkers() {
  return (
    <div className={styles.markers}>
      <hr className={styles.rule} />
      <ul className={styles.list}>
        {MARKERS.map(({ label, Icon }) => (
          <li key={label} className={styles.item}>
            <Icon className={styles.icon} />
            <span className={`type-label ${styles.label}`}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
