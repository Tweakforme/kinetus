"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartIcon } from "@/components/icons/LineIcons";
import { HEADER_ICON_LINKS } from "@/lib/site";
import styles from "./CartLink.module.css";

/** Dispatched by cart actions with the new count, so the header updates at once. */
export const CART_COUNT_EVENT = "kinetus:cart-count";

export function announceCartCount(count: number): void {
  window.dispatchEvent(new CustomEvent<number>(CART_COUNT_EVENT, { detail: count }));
}

/**
 * Header cart icon with the item count (deck: cart at top right). The count is fetched in
 * the browser from /api/cart/count, never rendered on the server, so every page that
 * shows the header stays statically rendered. It refetches on navigation (an order
 * placed clears the cart) and updates immediately from CART_COUNT_EVENT.
 */
export function CartLink() {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart/count", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: unknown) => {
        if (!cancelled && typeof value === "number") {
          setCount(value);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const onCount = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (typeof detail === "number") {
        setCount(detail);
      }
    };
    window.addEventListener(CART_COUNT_EVENT, onCount);
    return () => window.removeEventListener(CART_COUNT_EVENT, onCount);
  }, []);

  const shown = count ?? 0;
  const label = shown === 0 ? "Cart, empty" : `Cart, ${shown} ${shown === 1 ? "item" : "items"}`;

  return (
    <Link href={HEADER_ICON_LINKS.cart.href} className={styles.cart} aria-label={label}>
      <CartIcon size={28} />
      {shown > 0 && (
        <span className={`numeric ${styles.badge}`} aria-hidden="true">
          {shown > 99 ? "99+" : shown}
        </span>
      )}
    </Link>
  );
}
