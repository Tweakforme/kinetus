"use client";

import { useProductSelection } from "./ProductSelection";
import styles from "./ProductSizeLine.module.css";

type ProductSizeLineProps = {
  /** Word appended after the variant label, e.g. "blend" gives "80 MG BLEND" (slide 13). */
  suffix?: string;
};

/**
 * The size line under the product name (deck slides 9 and 13): the selected variant's
 * label in the condensed face with a short teal rule beneath. Follows the size chips in
 * the panel through the shared selection context. Renders nothing without variants.
 */
export function ProductSizeLine({ suffix }: ProductSizeLineProps) {
  const { selected } = useProductSelection();

  if (!selected) {
    return null;
  }

  const text = suffix ? `${selected.label} ${suffix}` : selected.label;

  return (
    <p className={styles.sizeLine}>
      <span className={styles.label}>{text}</span>
      <span className={styles.rule} aria-hidden="true" />
    </p>
  );
}
