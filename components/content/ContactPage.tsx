import Link from "next/link";
import {
  ArrowRightIcon,
  DocumentIcon,
  EnvelopeIcon,
  GlobeIcon,
} from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
import { canonicalUrl } from "@/lib/seo";
import { CONTACT_EMAIL, FOOTER_POLICY_LINKS, LOCATION, SITE_NAME } from "@/lib/site";
import { ContactForm } from "./ContactForm";
import { ContentHeader } from "./ContentHeader";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";
import styles from "./ContactPage.module.css";

const LEDE =
  "Questions about products, documentation, orders or research applications can be sent to the Kinetus BioLabs team by email.";

const DOCUMENTATION_NOTE =
  "Batch documentation is available on request; include the product name and the batch reference printed on the unit.";

const RELATED_LINKS = [
  { label: "Frequently asked questions", href: "/faq" },
  ...FOOTER_POLICY_LINKS.filter((link) =>
    ["/shipping-policy", "/returns-policy"].includes(link.href),
  ),
];

/**
 * Contact (deck slide 23): the enquiry form on the left, which saves each message and
 * emails it to the client (lib/contact.ts), and a white details card on the right with the
 * one confirmed channel, the confirmed location, the documentation note and the related
 * policy links.
 */
export function ContactPage() {
  return (
    <article className={layout.page}>
      <ContentHeader eyebrow={SITE_NAME} title="Contact" lede={LEDE} />

      <Container className={styles.body} data-reveal="">
        <section className={styles.formColumn} aria-labelledby="inquiries-heading">
          <p className={`type-eyebrow ${styles.formEyebrow}`}>Send a message</p>
          <h2 id="inquiries-heading" className={`type-h2 ${styles.formTitle}`}>
            Inquiries
          </h2>
          <ContactForm />
        </section>

        <aside className={styles.card} aria-labelledby="contact-details-heading">
          <h2 id="contact-details-heading" className={`type-label ${styles.cardHeading}`}>
            Contact details
          </h2>

          <ul className={styles.details}>
            <li className={styles.detail}>
              <span className={styles.detailIcon} aria-hidden="true">
                <EnvelopeIcon size={26} />
              </span>
              <span className={styles.detailText}>
                <span className={styles.detailLabel}>Email</span>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.detailLink}>
                  {CONTACT_EMAIL}
                </a>
              </span>
            </li>
            <li className={styles.detail}>
              <span className={styles.detailIcon} aria-hidden="true">
                <GlobeIcon size={26} />
              </span>
              <span className={styles.detailText}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{LOCATION}</span>
              </span>
            </li>
            <li className={styles.detail}>
              <span className={styles.detailIcon} aria-hidden="true">
                <DocumentIcon size={26} />
              </span>
              <span className={styles.detailText}>
                <span className={styles.detailLabel}>Documentation</span>
                <span className={styles.detailValue}>{DOCUMENTATION_NOTE}</span>
              </span>
            </li>
          </ul>

          <div className={styles.related}>
            <p className={`type-label ${styles.relatedLabel}`}>Before you write</p>
            <ul className={styles.relatedLinks}>
              {RELATED_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`${buttons.link} ${buttons.linkTeal}`}>
                    {link.label}
                    <ArrowRightIcon size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>

      <ContentJsonLd
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "Contact", url: canonicalUrl("/contact") },
        ]}
      />
    </article>
  );
}
