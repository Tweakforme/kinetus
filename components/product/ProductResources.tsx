"use client";

import { useRef, useState } from "react";
import { DocumentIcon, DocumentSearchIcon } from "@/components/icons/LineIcons";
import { InformationSheetDialog } from "./InformationSheetDialog";
import { useProductSelection } from "./ProductSelection";
import styles from "./ProductResources.module.css";

export type InformationSheet = { url: string; alt: string };

type ProductResourcesProps = {
  productName: string;
  /** The product's information sheet image, or null when none has been uploaded. */
  sheet: InformationSheet | null;
};

/**
 * The two document buttons under the product copy (the client's mockup shows them as
 * metallic octagon badges; these are built from the site's own button tokens instead).
 * PRODUCT INFORMATION (teal) opens the product's information sheet in a full-screen
 * viewer; TEST REPORTS (bordered) opens the selected size's third-party report in a new
 * tab. Each button exists only when there is something behind it: no sheet, no Product
 * Information button; a size without a report link, no Test Reports button. With neither,
 * nothing is rendered.
 */
export function ProductResources({ productName, sheet }: ProductResourcesProps) {
  const { selected } = useProductSelection();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reportUrl = selected?.testReportUrl ?? null;

  if (!sheet && !reportUrl) {
    return null;
  }

  return (
    <div className={styles.resources}>
      {sheet && (
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.button} ${styles.primary}`}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <DocumentIcon size={30} className={styles.icon} />
          <span className={styles.label}>Product information</span>
        </button>
      )}
      {reportUrl && selected && (
        <a
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.secondary}`}
        >
          <DocumentSearchIcon size={30} className={styles.icon} />
          <span className={styles.label}>
            Test reports
            <span className="visually-hidden">
              {" "}
              for {productName} {selected.label} (opens in a new tab)
            </span>
          </span>
        </a>
      )}
      {sheet && (
        <InformationSheetDialog
          open={open}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
          productName={productName}
          sheet={sheet}
        />
      )}
    </div>
  );
}
