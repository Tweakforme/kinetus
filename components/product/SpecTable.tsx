import type { SpecRow } from "@/lib/products";
import styles from "./SpecTable.module.css";

type SpecTableProps = {
  rows: SpecRow[];
};

/**
 * Specification rows: uppercase Inter key, plain value, a hairline between rows; two
 * columns from tablet. Callers pass populated rows only and hide the section when there
 * are none; an empty list renders nothing.
 */
export function SpecTable({ rows }: SpecTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className={styles.table}>
      {rows.map((row) => (
        <div key={row.key} className={styles.row}>
          <dt className={styles.key}>{row.key}</dt>
          <dd className={styles.value}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
