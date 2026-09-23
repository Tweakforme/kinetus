"use client";

import Link from "next/link";
import { useId, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { addToCart } from "@/app/(site)/cart/actions";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { CartIcon, ClipboardCheckIcon, DocumentIcon } from "@/components/icons/LineIcons";
import { announceCartCount } from "@/components/layout/CartLink";
import buttons from "@/components/ui/buttons.module.css";
import { createInFlight } from "@/lib/in-flight";
import { formatCad, tierPreview, type VolumeTier } from "@/lib/pricing";
import { CONTACT_LINK } from "@/lib/site";
import { useProductSelection } from "./ProductSelection";
import styles from "./VariantPanel.module.css";

type VariantPanelProps = {
  /** Active volume discount tiers; the list is hidden when there are none. */
  tiers: VolumeTier[];
  /** /documentation#<slug> when the product has a test report link, otherwise omitted. */
  testReportsHref?: string;
};

type AddStatus = { tone: "ok" | "error"; message: string } | null;

/**
 * The bordered panel of the product hero (deck slide 9): "SELECT SIZE" chips, the
 * quantity stepper, a hairline, the price with "CAD", the volume pricing lines, ADD TO
 * CART, and "REQUEST BATCH DOCUMENTATION" (the deck's ADD TO WISHLIST) to the contact
 * page.
 *
 * Chips follow the radio-group keyboard pattern (roving tabindex, arrow keys, Home/End).
 * The selection lives in ProductSelectionProvider so the size line in the copy column
 * follows it. Prices shown here are display only: the add action sends a variant id and
 * a quantity, and the cart prices everything again on the server.
 */
export function VariantPanel({ tiers, testReportsHref }: VariantPanelProps) {
  const { variants, selected, select } = useProductSelection();
  const labelId = useId();
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<AddStatus>(null);
  const [pending, startTransition] = useTransition();
  const [addFlight] = useState(createInFlight);

  const selectAt = (index: number) => {
    const variant = variants[index];
    if (!variant) {
      return;
    }
    onSelectVariant(variant.id);
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

  const available = selected?.trackInventory ? Math.max(0, selected.stock ?? 0) : null;
  const outOfStock = available === 0;
  const stockStatus =
    selected && available !== null
      ? available > 0
        ? { text: "In stock", tone: styles.inStock }
        : { text: "Out of stock", tone: styles.outOfStock }
      : null;
  const maxQuantity = Math.min(99, available ?? 99);

  const onSelectVariant = (id: string) => {
    select(id);
    setQuantity(1);
    setStatus(null);
  };

  const onAdd = () => {
    // `pending` updates only after a re-render; the in-flight flag also stops a second
    // activation in the same task, which would otherwise add the item twice.
    if (!selected || outOfStock || pending || !addFlight.start()) {
      return;
    }
    setStatus(null);
    startTransition(async () => {
      try {
        const result = await addToCart(selected.id, quantity);
        announceCartCount(result.count);
        setStatus({ tone: result.status === "ok" ? "ok" : "error", message: result.message });
      } catch {
        setStatus({ tone: "error", message: "The item could not be added. Please try again." });
      } finally {
        addFlight.finish();
      }
    });
  };

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
                    onClick={() => onSelectVariant(variant.id)}
                    onKeyDown={(event) => onChipKeyDown(event, index)}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>

          <QuantityStepper
            label="Quantity"
            value={quantity}
            onChange={(next) => {
              setQuantity(next);
              setStatus(null);
            }}
            max={maxQuantity}
            disabled={outOfStock}
          />

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

      {selected && !outOfStock && tiers.length > 0 && (
        <div className={styles.tiers}>
          <p className={styles.tiersLabel}>Volume pricing</p>
          <ul className={styles.tierList}>
            {tiers.map((tier) => {
              const preview = tierPreview(selected.priceCents, tier);
              return (
                <li key={tier.minQuantity} className={styles.tier}>
                  <span className={styles.tierBuy}>Buy {tier.minQuantity}</span>
                  <span className={styles.tierSave}>Save {tier.percentOff}%</span>
                  <span className={`numeric ${styles.tierPrice}`}>
                    {formatCad(preview.totalCents)}{" "}
                    <span className={styles.tierEach}>({formatCad(preview.eachCents)} each)</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={styles.tierNote}>Applies to the total quantity in your cart.</p>
        </div>
      )}

      <div className={styles.actions}>
        {selected && (
          <button
            type="button"
            className={`${buttons.solid} ${styles.add}`}
            onClick={onAdd}
            disabled={outOfStock}
            aria-disabled={pending || undefined}
          >
            {outOfStock ? "Out of stock" : pending ? "Adding" : "Add to cart"}
            {!outOfStock && <CartIcon size={22} />}
          </button>
        )}
        <p className={styles.addStatus} role="status" aria-live="polite">
          {outOfStock && "This size is out of stock and cannot be ordered right now."}
          {!outOfStock && status && (
            <span className={status.tone === "error" ? styles.addError : styles.addOk}>
              {status.message}{" "}
              {status.tone === "ok" && (
                <Link href="/cart" className={styles.viewCart}>
                  View cart
                </Link>
              )}
            </span>
          )}
        </p>
        <Link
          href={CONTACT_LINK.href}
          className={`${buttons.link} ${buttons.linkTeal} ${styles.documentation}`}
        >
          <DocumentIcon size={20} />
          Request batch documentation
        </Link>
        {testReportsHref && (
          <Link
            href={testReportsHref}
            className={`${buttons.link} ${buttons.linkTeal} ${styles.documentation}`}
          >
            <ClipboardCheckIcon size={20} />
            View test reports
          </Link>
        )}
      </div>
    </div>
  );
}
