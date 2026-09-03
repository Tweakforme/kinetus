import type { SpecRow } from "@/lib/products";
import styles from "./SpecTable.module.css";

type SpecTableProps = {
  rows: SpecRow[];
};

/**
 * Specification table — Figma 28:10 (desktop two-column) / 69:161 (mobile stacked).
 * Callers pass populated rows only; an empty list renders nothing.
 */
export function SpecTable({ rows }: SpecTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className={styles.table}>
      {rows.map((row) => (
        <div key={row.key} className={styles.row}>
          <dt className={`type-label ${styles.key}`}>{row.key}</dt>
          <dd className={`type-body numeric ${styles.value}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
