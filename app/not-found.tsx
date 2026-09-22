import type { Metadata } from "next";
import Link from "next/link";
import { ContentHeader } from "@/components/content/ContentHeader";
import buttons from "@/components/ui/buttons.module.css";
import { ALL_PRODUCTS_LINK } from "@/lib/site";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** 404: the content band with a huge status code, one line, and two routes out. */
export default function NotFound() {
  return (
    <div className={styles.page}>
      <ContentHeader
        breadcrumb={false}
        eyebrow="Error"
        statusCode="404"
        title="Page not found"
        lede="The address may be mistyped, or the page may have moved."
        actions={
          <>
            <Link href={ALL_PRODUCTS_LINK.href} className={buttons.solid}>
              {ALL_PRODUCTS_LINK.label}
            </Link>
            <Link href="/" className={`${buttons.outline} ${buttons.outlineOnDark}`}>
              Go to homepage
            </Link>
          </>
        }
      />
    </div>
  );
}
