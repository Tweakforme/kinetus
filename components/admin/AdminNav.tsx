"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/settings", label: "Settings" },
];

/** The admin's four sections; the current one is marked for sight and screen readers. */
export function AdminNav() {
  const pathname = usePathname();
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
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
