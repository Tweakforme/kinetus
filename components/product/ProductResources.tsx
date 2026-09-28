"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { DocumentIcon, DocumentSearchIcon } from "@/components/icons/LineIcons";
import { InformationSheetDialog } from "./InformationSheetDialog";
import { useProductSelection } from "./ProductSelection";
import styles from "./ProductResources.module.css";

export type InformationSheet = { url: string; alt: string };

/**
 * The client's Test Reports seal, keyed to a transparent background and trimmed to the
 * octagon (240 x 229, twice its display size). Shown at 120px as decoration only.
 */
const TEST_REPORTS_SEAL = { src: "/images/seals/test-reports-seal.png", width: 120, height: 114 };

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
 * nothing is rendered. The client's Test Reports seal sits under the buttons as decoration
 * (not a link), and only beside a Test Reports button, so it never suggests a report the
 * selected size does not have.
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
    <div className={styles.block}>
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
      </div>
      {reportUrl && (
        <Image
          src={TEST_REPORTS_SEAL.src}
          alt=""
          aria-hidden="true"
          width={TEST_REPORTS_SEAL.width}
          height={TEST_REPORTS_SEAL.height}
          className={styles.seal}
        />
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
