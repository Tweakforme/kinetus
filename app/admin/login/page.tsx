import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import styles from "@/components/admin/admin.module.css";
import { getAdmin, safeAdminPath } from "@/lib/admin/auth";
import { isSessionSecretConfigured } from "@/lib/admin/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/** /admin/login: the only admin page reachable without a session. */
export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const target = safeAdminPath(next);
  if (await getAdmin()) {
    redirect(target);
  }

  return (
    <main id="main-content" className={styles.loginMain}>
      <div className={styles.loginCard}>
        <Image
          src="/brand/kinetus-logo-horizontal.png"
          alt="Kinetus BioLabs"
          width={270}
          height={64}
          className={styles.loginLogo}
          preload
        />
        <h1 className={styles.loginTitle}>Admin sign-in</h1>
        <p className={styles.loginIntro}>Manage the catalogue, discounts and store settings.</p>
        <LoginForm next={target} configured={isSessionSecretConfigured()} />
        <p className={styles.loginFoot}>
          Forgotten your password? Ask whoever manages the site to reset it.
        </p>
      </div>
    </main>
  );
}
