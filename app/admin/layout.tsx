import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Everything under /admin: never indexed (this meta tag, the X-Robots-Tag header set by
 * proxy.ts, and the Disallow in robots.txt), and without the public site's chrome.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Kinetus admin" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
