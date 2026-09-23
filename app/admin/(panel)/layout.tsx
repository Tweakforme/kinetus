import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "@/components/admin/admin.module.css";
import { ADMIN_HOME, requireAdmin } from "@/lib/admin/auth";
import { countMessagesNeedingAttention } from "@/lib/admin/messages";
import { countOrdersNeedingAttention } from "@/lib/admin/orders";
import { logout } from "../actions";

/**
 * Signed-in admin shell: the navy bar with the sections (Orders and Messages carry the
 * counts of what is waiting), a link to the public site and Log out. Pages and server
 * actions each check the session themselves as well; a layout is not re-rendered on every
 * navigation, so it cannot be the only check.
 */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const [orders, messages] = await Promise.all([
    countOrdersNeedingAttention(),
    countMessagesNeedingAttention(),
  ]);

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href={ADMIN_HOME} className={styles.brand}>
            Kinetus <span className={styles.brandTag}>Admin</span>
          </Link>
          <AdminNav attention={{ orders, messages }} />
          <div className={styles.account}>
            <a href="/" className={styles.topbarLink} target="_blank" rel="noopener">
              View site<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            {/* Who is signed in lives on Log out: with six sections the bar has no room for it. */}
            <form action={logout}>
              <button
                type="submit"
                className={styles.topbarButton}
                title={`Signed in as ${admin.email}`}
              >
                Log out<span className="visually-hidden"> (signed in as {admin.email})</span>
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
