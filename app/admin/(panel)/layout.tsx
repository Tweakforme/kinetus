import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "@/components/admin/admin.module.css";
import { ADMIN_HOME, requireAdmin } from "@/lib/admin/auth";
import { countOrdersNeedingAttention } from "@/lib/admin/orders";
import { logout } from "../actions";

/**
 * Signed-in admin shell: the navy bar with the sections (Orders carries the count of
 * orders needing attention), a link to the public site and Log out. Pages and server
 * actions each check the session themselves as well; a layout is not re-rendered on every
 * navigation, so it cannot be the only check.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const attentionCount = await countOrdersNeedingAttention();

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href={ADMIN_HOME} className={styles.brand}>
            Kinetus <span className={styles.brandTag}>Admin</span>
          </Link>
          <AdminNav attentionCount={attentionCount} />
          <div className={styles.account}>
            <span className={styles.accountEmail}>{admin.email}</span>
            <a href="/" className={styles.topbarLink} target="_blank" rel="noopener">
              View site<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <form action={logout}>
              <button type="submit" className={styles.topbarButton}>
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </>
  );
}
