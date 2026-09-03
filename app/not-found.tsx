import type { Metadata } from "next";
import Link from "next/link";
import buttons from "@/components/home/buttons.module.css";
import { Container } from "@/components/layout/Container";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { ALL_PRODUCTS_LINK } from "@/lib/site";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** 404 in the documentation language: large mono status, plain explanation, two routes out. */
export default function NotFound() {
  return (
    <Container className={styles.page}>
      <div className={styles.frame}>
        <RegistrationMarks />
        <p className={`type-label ${styles.eyebrow}`}>Status</p>
        <p className={`type-display-xl numeric ${styles.code}`} aria-hidden="true">
          404
        </p>
        <h1 className={`type-h1 ${styles.title}`}>Page not found</h1>
        <p className={`type-body ${styles.copy}`}>
          The address may be mistyped, or the page may have moved. The catalogue and the homepage
          are one step away.
        </p>
        <div className={styles.actions}>
          <Link href={ALL_PRODUCTS_LINK.href} className={`type-label ${buttons.primary}`}>
            {ALL_PRODUCTS_LINK.label}
          </Link>
          <Link href="/" className={`type-label ${buttons.secondary}`}>
            Go to homepage
          </Link>
        </div>
      </div>
    </Container>
  );
}
