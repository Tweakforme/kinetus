import { RESEARCH_USE_COPY_LINES } from "@/lib/site";
import styles from "./ProductInfoBand.module.css";

type ProductInfoBandProps = {
  /** Physical form, or null when the catalogue does not record one. */
  form: string | null;
  /** Active variant labels in display order. */
  presentations: string[];
};

/**
 * Information band under the hero: structural facts only (form, presentations, batch
 * reference, documentation, research use), separated by hairline rules. A fact the
 * catalogue does not record is omitted rather than shown as a placeholder, so no cell
 * ever reads "Not specified" to a customer.
 */
export function ProductInfoBand({ form, presentations }: ProductInfoBandProps) {
  const items = [
    ...(form ? [{ label: "Form", value: form }] : []),
    ...(presentations.length > 0
      ? [{ label: "Presentation", value: presentations.join(" · ") }]
      : []),
    { label: "Batch reference", value: "Printed on every unit" },
    { label: "Documentation", value: "Batch-specific COA on request" },
    { label: "Research use", value: RESEARCH_USE_COPY_LINES[0].replace(/\.$/, "") },
  ];

  return (
    <dl className={styles.band}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
