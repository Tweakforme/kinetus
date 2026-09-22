"use client";

import Link from "next/link";
import { useId, useRef, type KeyboardEvent } from "react";
import { DocumentIcon, EnvelopeIcon } from "@/components/icons/LineIcons";
import buttons from "@/components/ui/buttons.module.css";
import { CONTACT_LINK } from "@/lib/site";
import { useProductSelection } from "./ProductSelection";
import styles from "./VariantPanel.module.css";

/**
 * The bordered panel of the product hero (deck slide 9): "SELECT SIZE" chips, a
 * hairline, the price with "CAD", then the two enquiry actions. The deck's ADD TO CART
 * and quantity stepper are replaced by "ENQUIRE TO ORDER" and its ADD TO WISHLIST by
 * "REQUEST BATCH DOCUMENTATION"; both go to the contact page.
 *
 * Chips follow the radio-group keyboard pattern (roving tabindex, arrow keys, Home/End).
 * The selection lives in ProductSelectionProvider so the size line in the copy column
 * follows it. Sale pricing was resolved and formatted on the server.
 */
export function VariantPanel() {
  const { variants, selected, select } = useProductSelection();
  const labelId = useId();
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectAt = (index: number) => {
    const variant = variants[index];
    if (!variant) {
      return;
    }
    select(variant.id);
    chipRefs.current[index]?.focus();
  };

  const onChipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = variants.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectAt(next);
  };

  const stockStatus =
    selected && selected.trackInventory
      ? (selected.stock ?? 0) > 0
        ? { text: "In stock", tone: styles.inStock }
        : { text: "Out of stock", tone: styles.outOfStock }
      : null;

  return (
    <div className={styles.panel}>
      {selected && (
        <>
          <div className={styles.selector}>
            <p id={labelId} className={styles.selectorLabel}>
              Select size
            </p>
            <div role="radiogroup" aria-labelledby={labelId} className={styles.chips}>
              {variants.map((variant, index) => {
                const isSelected = variant.id === selected.id;
                return (
                  <button
                    key={variant.id}
                    ref={(element) => {
                      chipRefs.current[index] = element;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    className={isSelected ? `${styles.chip} ${styles.chipSelected}` : styles.chip}
                    onClick={() => select(variant.id)}
                    onKeyDown={(event) => onChipKeyDown(event, index)}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className={styles.rule} />

          <div className={styles.price} aria-live="polite" aria-atomic="true">
            <p className={styles.priceRow}>
              <span className={`numeric ${styles.priceValue}`}>{selected.priceLabel}</span>
              {selected.compareAtLabel !== null && (
                <s className={`numeric ${styles.wasPrice}`}>
                  <span className="visually-hidden">Previously </span>
                  {selected.compareAtLabel}
                </s>
              )}
              <span className={styles.currency}>CAD</span>
            </p>
            {stockStatus && (
              <p className={`${styles.stock} ${stockStatus.tone}`}>{stockStatus.text}</p>
            )}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <Link href={CONTACT_LINK.href} className={`${buttons.solid} ${styles.enquire}`}>
          Enquire to order
          <EnvelopeIcon size={22} />
        </Link>
        <Link
          href={CONTACT_LINK.href}
          className={`${buttons.link} ${buttons.linkTeal} ${styles.documentation}`}
        >
          <DocumentIcon size={20} />
          Request batch documentation
        </Link>
      </div>
    </div>
  );
}
