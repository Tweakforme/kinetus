"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin/orders", label: "Orders", showsAttention: true },
  { href: "/admin/products", label: "Products", showsAttention: false },
  { href: "/admin/collections", label: "Collections", showsAttention: false },
  { href: "/admin/discounts", label: "Discounts", showsAttention: false },
  { href: "/admin/settings", label: "Settings", showsAttention: false },
];

/** Plain-text count of orders needing attention (app/admin/(panel)/orders/count/route.ts). */
const ATTENTION_COUNT_PATH = "/admin/orders/count";

/**
 * The count of orders waiting on the client. The layout renders it, but a layout is not
 * re-rendered when moving between admin pages, so it is fetched again on every navigation;
 * a save that re-renders the layout replaces it as well.
 */
function useAttentionCount(rendered: number, pathname: string): number {
  const [count, setCount] = useState(rendered);
  const [seen, setSeen] = useState(rendered);
  if (rendered !== seen) {
    setSeen(rendered);
    setCount(rendered);
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch(ATTENTION_COUNT_PATH, { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.text() : null))
      .then((body) => {
        const value = body === null ? NaN : Number(body);
        if (Number.isInteger(value) && value >= 0) {
          setCount(value);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname]);

  return count;
}

/** The admin's sections; the current one is marked for sight and screen readers. */
export function AdminNav({ attentionCount }: { attentionCount: number }) {
  const pathname = usePathname();
  const count = useAttentionCount(attentionCount, pathname);

  return (
    <nav className={styles.nav} aria-label="Admin sections">
      <ul className={styles.navList}>
        {LINKS.map((link) => {
          const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.navLink}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
                {link.showsAttention && count > 0 && (
                  <span className={styles.navCount}>
                    {count}
                    <span className="visually-hidden">
                      {count === 1 ? " order needs attention" : " orders need attention"}
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
