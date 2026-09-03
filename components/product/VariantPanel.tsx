"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { formatCad, type VariantView } from "@/lib/products";
import styles from "./VariantPanel.module.css";

type VariantPanelProps = {
  variants: VariantView[];
};

/**
 * Presentation selector + price + stock status — Figma 27:7 / 27:16 (desktop) and
 * 68:181 / 68:190 (mobile). One chip per active variant, the first selected by default.
 * Chips follow the radio-group keyboard pattern (roving tabindex, arrow keys, Home/End).
 * Sale pricing is resolved on the server (compareAtCents) so this component only formats.
 */
export function VariantPanel({ variants }: VariantPanelProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(variants[0]?.id);
  const labelId = useId();
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];

  if (!selected) {
    return null;
  }

  const selectAt = (index: number) => {
    const variant = variants[index];
    if (!variant) {
      return;
    }
    setSelectedId(variant.id);
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

  const stockStatus = selected.trackInventory
    ? (selected.stock ?? 0) > 0
      ? { text: "In stock", tone: styles.inStock }
      : { text: "Out of stock", tone: styles.outOfStock }
    : null;

  return (
    <div className={styles.panel}>
      <div className={styles.selector}>
        <p id={labelId} className={`type-label ${styles.selectorLabel}`}>
          Presentation
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
                onClick={() => setSelectedId(variant.id)}
                onKeyDown={(event) => onChipKeyDown(event, index)}
              >
                <span className="type-label">{variant.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.price} aria-live="polite" aria-atomic="true">
        <p className={styles.priceRow}>
          <span className={`type-h2 ${styles.priceValue}`}>{formatCad(selected.priceCents)}</span>
          {selected.compareAtCents !== null && (
            <s className={styles.wasPrice}>
              <span className={styles.visuallyHidden}>Previously </span>
              {formatCad(selected.compareAtCents)}
            </s>
          )}
          <span className={`type-label ${styles.currency}`}>CAD</span>
        </p>
        {stockStatus && (
          <p className={`type-body-s ${styles.stock} ${stockStatus.tone}`}>{stockStatus.text}</p>
        )}
      </div>
    </div>
  );
}
