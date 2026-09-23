"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  removeFromCart,
  updateCartQuantity,
  type CartActionResult,
} from "@/app/(site)/cart/actions";
import { CloseIcon } from "@/components/icons/LineIcons";
import { announceCartCount } from "@/components/layout/CartLink";
import { formatCad } from "@/lib/pricing";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./CartLines.module.css";

/** What the table shows for one line; resolved and priced on the server. */
export type CartLineView = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  unitPriceCents: number;
  compareAtCents: number | null;
  quantity: number;
  lineTotalCents: number;
  imageUrl: string | null;
  imageAlt: string;
  available: number | null;
  shortfall: number;
};

/**
 * Line items (deck slide 21): remove, thumbnail, product and size, unit price, quantity
 * stepper, line subtotal. A table at desktop; each row becomes a compact card below 768px.
 * Changes go straight to the server (no "Update cart" step); the page then re-renders
 * with prices and totals recalculated there.
 */
export function CartLines({ lines }: { lines: CartLineView[] }) {
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">Items in your cart</caption>
      <thead className={styles.head}>
        <tr>
          <th scope="col">
            <span className="visually-hidden">Remove</span>
          </th>
          <th scope="col">
            <span className="visually-hidden">Image</span>
          </th>
          <th scope="col">Product</th>
          <th scope="col" className={styles.alignEnd}>
            Price
          </th>
          <th scope="col">Quantity</th>
          <th scope="col" className={styles.alignEnd}>
            Subtotal
          </th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <CartLineRow key={line.variantId} line={line} />
        ))}
      </tbody>
    </table>
  );
}

function CartLineRow({ line }: { line: CartLineView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const name = `${line.productName} ${line.variantLabel}`;

  const run = (action: () => Promise<CartActionResult>) => {
    if (pending) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        announceCartCount(result.count);
        if (result.status === "error") {
          setError(result.message);
        }
        router.refresh();
      } catch {
        setError("That change could not be saved. Please try again.");
      }
    });
  };

  const max = Math.min(99, Math.max(line.quantity, line.available ?? 99));

  return (
    <tr className={pending ? `${styles.row} ${styles.pending}` : styles.row} aria-busy={pending}>
      <td className={styles.remove}>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => run(() => removeFromCart(line.variantId))}
          disabled={pending}
          aria-label={`Remove ${name} from cart`}
        >
          <CloseIcon size={20} />
        </button>
      </td>
      <td className={styles.thumb}>
        {line.imageUrl ? (
          <Image
            src={line.imageUrl}
            alt=""
            width={64}
            height={64}
            sizes="64px"
            className={styles.image}
          />
        ) : (
          <span className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </td>
      <th scope="row" className={styles.product}>
        <Link href={`/products/${line.productSlug}`} className={styles.productLink}>
          {line.productName}
        </Link>
        <span className={styles.variant}>{line.variantLabel}</span>
        {line.shortfall > 0 && (
          <span className={styles.warning}>
            {line.available === 0
              ? "Out of stock. Remove this item to continue."
              : `Only ${line.available} available. Reduce the quantity to continue.`}
          </span>
        )}
        {error && (
          <span className={styles.warning} role="alert">
            {error}
          </span>
        )}
      </th>
      <td className={`${styles.price} ${styles.alignEnd}`}>
        <span className={styles.cellLabel}>Price</span>
        <span className="numeric">{formatCad(line.unitPriceCents)}</span>
        {line.compareAtCents !== null && (
          <s className={`numeric ${styles.was}`}>
            <span className="visually-hidden">Previously </span>
            {formatCad(line.compareAtCents)}
          </s>
        )}
      </td>
      <td className={styles.quantity}>
        <QuantityStepper
          size="compact"
          value={line.quantity}
          max={max}
          ariaLabel={`Quantity, ${name}`}
          onChange={(quantity) => run(() => updateCartQuantity(line.variantId, quantity))}
        />
      </td>
      <td className={`${styles.subtotal} ${styles.alignEnd}`}>
        <span className={styles.cellLabel}>Subtotal</span>
        <span className="numeric">{formatCad(line.lineTotalCents)}</span>
      </td>
    </tr>
  );
}
