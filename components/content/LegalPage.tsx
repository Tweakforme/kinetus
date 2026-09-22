import Link from "next/link";
import { ArrowRightIcon, DocumentIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
import { faqDocument } from "@/content/faq";
import { privacyPolicyDocument } from "@/content/privacy-policy";
import { researchUseDocument } from "@/content/research-use";
import { returnsPolicyDocument } from "@/content/returns-policy";
import { shippingPolicyDocument } from "@/content/shipping-policy";
import { termsDocument } from "@/content/terms";
import { canonicalUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { ContentHeader } from "./ContentHeader";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";
import styles from "./LegalPage.module.css";

export const LEGAL_DESCRIPTION =
  "The policies and disclaimer that govern the Kinetus BioLabs website, orders and research materials, together with the frequently asked questions.";

type LegalEntry = {
  title: string;
  description: string;
  href: string;
};

/** The five client documents (deck slide 27) in the footer's order, plus the FAQ. */
const DOCUMENTS: LegalEntry[] = [
  termsDocument,
  privacyPolicyDocument,
  shippingPolicyDocument,
  returnsPolicyDocument,
  researchUseDocument,
].map((doc) => ({ title: doc.title, description: doc.description, href: `/${doc.slug}` }));

const ENTRIES: LegalEntry[] = [
  ...DOCUMENTS,
  { title: "FAQ", description: faqDocument.description, href: `/${faqDocument.slug}` },
];

/** Legal index: the navy band and one row per document, each linking to its page. */
export function LegalPage() {
  return (
    <article className={layout.page}>
      <ContentHeader eyebrow={SITE_NAME} title="Legal" lede={LEGAL_DESCRIPTION} />

      <Container className={styles.body} data-reveal="">
        <ul className={styles.list} aria-label="Legal documents">
          {ENTRIES.map((entry) => (
            <li key={entry.href}>
              <Link href={entry.href} className={styles.row}>
                <DocumentIcon size={32} className={styles.rowIcon} />
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{entry.title}</span>
                  <span className={styles.rowDescription}>{entry.description}</span>
                </span>
                <span className={`${buttons.link} ${buttons.linkTeal} ${styles.rowCta}`}>
                  Read
                  <ArrowRightIcon size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <ContentJsonLd
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "Legal", url: canonicalUrl("/legal") },
        ]}
      />
    </article>
  );
}
