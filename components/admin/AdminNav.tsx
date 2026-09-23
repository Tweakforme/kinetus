"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

export type AttentionCounts = { orders: number; messages: number };

type Section = { href: string; label: string; attention: keyof AttentionCounts | null };

const LINKS: Section[] = [
  { href: "/admin/orders", label: "Orders", attention: "orders" },
  { href: "/admin/messages", label: "Messages", attention: "messages" },
  { href: "/admin/products", label: "Products", attention: null },
  { href: "/admin/collections", label: "Collections", attention: null },
  { href: "/admin/discounts", label: "Discounts", attention: null },
  { href: "/admin/settings", label: "Settings", attention: null },
];

/** Plain-text counts (app/admin/(panel)/orders/count and messages/count route handlers). */
const COUNT_PATH: Record<keyof AttentionCounts, string> = {
  orders: "/admin/orders/count",
  messages: "/admin/messages/count",
};

const WAITING: Record<keyof AttentionCounts, [string, string]> = {
  orders: [" order needs attention", " orders need attention"],
  messages: [" message waiting", " messages waiting"],
};

const COUNTS_CHANGED = "kinetus:admin-counts-changed";

/**
 * Tells the admin bar that an order's status or a message's handled mark changed, so it
 * fetches its counts again. A save refreshes the page but not the layout the bar lives in.
 */
export function announceCountsChanged(): void {
  window.dispatchEvent(new Event(COUNTS_CHANGED));
}

/**
 * A count of things waiting on the client. The layout renders it, but a layout is not
 * re-rendered when moving between admin pages or after a save, so it is fetched again on
 * every navigation and whenever a save announces a change.
 */
function useAttentionCount(rendered: number, pathname: string, path: string): number {
  const [count, setCount] = useState(rendered);
  const [seen, setSeen] = useState(rendered);
  const [changes, setChanges] = useState(0);
  if (rendered !== seen) {
    setSeen(rendered);
    setCount(rendered);
  }

  useEffect(() => {
    const onChange = () => setChanges((value) => value + 1);
    window.addEventListener(COUNTS_CHANGED, onChange);
    return () => window.removeEventListener(COUNTS_CHANGED, onChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.text() : null))
      .then((body) => {
        const value = body === null ? NaN : Number(body);
        if (Number.isInteger(value) && value >= 0) {
          setCount(value);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname, path, changes]);

  return count;
}

/** The admin's sections; the current one is marked for sight and screen readers. */
export function AdminNav({ attention }: { attention: AttentionCounts }) {
  const pathname = usePathname();
  const counts: AttentionCounts = {
    orders: useAttentionCount(attention.orders, pathname, COUNT_PATH.orders),
    messages: useAttentionCount(attention.messages, pathname, COUNT_PATH.messages),
  };

  return (
    <nav className={styles.nav} aria-label="Admin sections">
      <ul className={styles.navList}>
        {LINKS.map((link) => {
          const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const count = link.attention ? counts[link.attention] : 0;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.navLink}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
                {link.attention && count > 0 && (
                  <span className={styles.navCount}>
                    {count}
                    <span className="visually-hidden">
                      {WAITING[link.attention][count === 1 ? 0 : 1]}
                    </span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
