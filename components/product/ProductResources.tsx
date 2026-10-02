"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { HEADER_ICON_LINKS } from "@/lib/site";
import { InformationSheetDialog } from "./InformationSheetDialog";
import { useProductSelection } from "./ProductSelection";
import styles from "./ProductResources.module.css";

export type InformationSheet = { url: string; alt: string };

/**
 * The client's badge artwork, supplied keyed and trimmed at four times these sizes
 * (260 x 395 and 380 x 375), shown at these sizes at every width.
 */
const INFORMATION_BADGE = {
  src: "/images/buttons/btn-product-information.png",
  width: 65,
  height: 99,
};
const REPORTS_BADGE = { src: "/images/buttons/btn-test-reports.png", width: 95, height: 94 };

/** The test reports and batch documentation page: where a size without a report links. */
const DOCUMENTATION_HREF = HEADER_ICON_LINKS.documentation.href;

type ProductResourcesProps = {
  productName: string;
  /** The product's information sheet image, or null when none has been uploaded. */
  sheet: InformationSheet | null;
  /** "Text below buttons" (admin), split into paragraphs; plain text, hidden when empty. */
  text?: string[];
};

/**
 * The client's two badges in the product hero's left column, under the fixed paragraph
 * and beside the gallery: side by side and centred on each other, with the product's
 * optional "Text below buttons" under them. PRODUCT INFORMATION opens the product's information
 * sheet in the full-screen viewer, and is shown only when a sheet has been uploaded. TEST
 * REPORTS is always shown: it opens the selected size's third-party report in a new tab
 * when the size has one, and otherwise the test reports and batch documentation page,
 * where batch-specific COAs are available on request, as the packaging states.
 */
export function ProductResources({ productName, sheet, text = [] }: ProductResourcesProps) {
  const { selected } = useProductSelection();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reportUrl = selected?.testReportUrl ?? null;

  const reportsBadge = (
    <Image
      src={REPORTS_BADGE.src}
      alt="View test reports"
      width={REPORTS_BADGE.width}
      height={REPORTS_BADGE.height}
      className={`${styles.image} ${styles.reportsImage}`}
    />
  );

  return (
    <div className={styles.block}>
      <div className={styles.resources}>
        {sheet && (
          <button
            ref={triggerRef}
            type="button"
            className={styles.badge}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <Image
              src={INFORMATION_BADGE.src}
              alt="View product information"
              width={INFORMATION_BADGE.width}
              height={INFORMATION_BADGE.height}
              className={`${styles.image} ${styles.informationImage}`}
            />
          </button>
        )}
        {reportUrl ? (
          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className={styles.badge}>
            {reportsBadge}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link href={DOCUMENTATION_HREF} className={styles.badge}>
            {reportsBadge}
          </Link>
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
      {text.length > 0 && (
        <div className={styles.text}>
          {text.map((paragraph, index) => (
            <p key={index} className="type-body">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
