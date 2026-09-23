import type { Metadata } from "next";
import Link from "next/link";
import { ListingPage } from "@/components/collection/ListingPage";
import { DocumentationSection } from "@/components/collection/DocumentationSection";
import { ArrowRightIcon, DocumentIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { formatStoreDate } from "@/lib/admin/forms";
import { getTestReports } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

const TITLE = "Test Reports";
const DESCRIPTION = `Third-party test reports for ${SITE_NAME} products, listed by product and strength and hosted by the testing provider.`;
const canonical = canonicalUrl("/documentation");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    url: canonical,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: canonicalUrl("/kinetus-logo.png"), alt: SITE_NAME }],
  },
};

const INTRO =
  "Test reports are issued by a third-party testing provider and hosted on the provider's own website. Reports are added here as they become available.";
/** Only said when there are links to follow. */
const LINKS_NOTE = "Each link opens the report for one product at one strength, in a new tab.";

/**
 * /documentation: every real third-party test report link, grouped by product (the client
 * sets them per strength in the admin). Only links that exist are shown; with none, a
 * neutral empty state. The client's COA mockup (cards with purity percentages, batch
 * numbers and assay dates) is deliberately not built: none of those figures are in the
 * data. The batch documentation request panel follows.
 */
export default async function DocumentationPage() {
  const products = (await getTestReports())
    .map((product) => ({
      ...product,
      // Admin input is validated as http(s); this keeps any other scheme off the page.
      reports: product.reports.filter((report) => /^https?:\/\//i.test(report.url)),
    }))
    .filter((product) => product.reports.length > 0);

  return (
    <ListingPage padTop>
      <Container as="section" className={styles.section} aria-labelledby="reports-heading">
        <SectionDivider id="reports-heading" as="h1" title={TITLE} />
        <p className={`type-body ${styles.intro}`}>
          {INTRO}
          {products.length > 0 && ` ${LINKS_NOTE}`}
        </p>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <DocumentIcon size={40} className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              No test reports are published yet. Batch-specific documentation is available on
              request.
            </p>
          </div>
        ) : (
          <ul className={styles.products}>
            {products.map((product) => (
              <li key={product.slug} id={product.slug} className={styles.product}>
                <h2 className={styles.productName}>
                  <Link href={`/products/${product.slug}`} className={styles.productLink}>
                    {product.name}
                  </Link>
                </h2>
                <ul className={styles.reports}>
                  {product.reports.map((report) => (
                    <li key={report.variantId} className={styles.report}>
                      <span className={styles.variant}>{report.label}</span>
                      {report.updatedAt && (
                        <span className={styles.updated}>
                          Updated {formatStoreDate(report.updatedAt)}
                        </span>
                      )}
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener"
                        className={styles.reportLink}
                      >
                        View report
                        <span className="visually-hidden">
                          {" "}
                          for {product.name} {report.label} (opens in a new tab)
                        </span>
                        <ArrowRightIcon size={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Container>

      <DocumentationSection />
    </ListingPage>
  );
}
