import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

/** Every public route shares the site chrome. /admin sits outside this group. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
