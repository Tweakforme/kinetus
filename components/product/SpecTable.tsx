import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import type { SpecRow } from "@/lib/products";
import styles from "./SpecTable.module.css";

type SpecTableProps = {
  rows: SpecRow[];
};

/**
 * Specification table — the page's showpiece (Phase 6 A7). Figma 28:10 (desktop
 * two-column) / 69:161 (mobile stacked), now with a mono index column, Inter uppercase
 * keys, mono values and a registration-marked hairline frame.
 * Callers pass populated rows only; an empty list renders nothing.
 */
export function SpecTable({ rows }: SpecTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.frame}>
      <RegistrationMarks />
      <dl className={styles.table}>
        {rows.map((row, index) => (
          <div key={row.key} className={styles.row}>
            <dt className={styles.key}>
              <span className={`type-label numeric ${styles.index}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.keyText}>{row.key}</span>
            </dt>
            <dd className={`numeric ${styles.value}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
