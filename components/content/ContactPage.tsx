import Link from "next/link";
import buttons from "@/components/home/buttons.module.css";
import { Container } from "@/components/layout/Container";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { SectionRule } from "@/components/marks/SectionRule";
import { canonicalUrl } from "@/lib/seo";
import { FOOTER_POLICY_LINKS, SITE_NAME } from "@/lib/site";
import { ContentHeader } from "./ContentHeader";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";
import styles from "./ContactPage.module.css";

/**
 * The only contact channel confirmed in the client's documents (Terms §18, Privacy §14).
 * TODO: confirm mailbox is live before launch.
 */
const CONTACT_EMAIL = "info@kinetusbiolabs.ca";

/** The client's documents give the company location as "Canada" and nothing more. */
const LOCATION = "Canada";

const LEDE =
  "Questions about products, documentation, orders or research applications can be sent to the Kinetus BioLabs team by email.";

const RELATED_LINKS = FOOTER_POLICY_LINKS.filter((link) =>
  ["/shipping-policy", "/returns-policy"].includes(link.href),
);

/**
 * Contact: one mailto channel, the confirmed location, and pointers to the FAQ and the
 * order-related policies. No form, no phone number, no hours: none is confirmed.
 */
export function ContactPage() {
  return (
    <article className={layout.page}>
      <ContentHeader kicker={SITE_NAME} title="Contact" lede={LEDE} />

      <Container className={styles.body} data-reveal="">
        <SectionRule />

        <div className={styles.channels}>
          <RegistrationMarks />
          <dl className={styles.channelList}>
            <div className={styles.channel}>
              <dt className={`type-label ${styles.channelLabel}`}>
                <span className={`numeric ${styles.channelIndex}`}>01</span>{" "}
                <span aria-hidden="true" className={styles.channelSlash}>
                  /
                </span>
                Email
              </dt>
              <dd className={styles.channelValue}>
                <a href={`mailto:${CONTACT_EMAIL}`} className={`type-h3 type-mono ${styles.email}`}>
                  {CONTACT_EMAIL}
                </a>
              </dd>
            </div>
            <div className={styles.channel}>
              <dt className={`type-label ${styles.channelLabel}`}>
                <span className={`numeric ${styles.channelIndex}`}>02</span>{" "}
                <span aria-hidden="true" className={styles.channelSlash}>
                  /
                </span>
                Location
              </dt>
              <dd className={`type-h3 ${styles.channelValue}`}>{LOCATION}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.related}>
          <p className={`type-label ${styles.relatedLabel}`}>Before you write</p>
          <p className={`type-body ${styles.relatedCopy}`}>
            Common questions about documentation, storage and research use are answered in the FAQ.
            Order questions are covered by the shipping and returns policies.
          </p>
          <ul className={styles.relatedLinks}>
            <li>
              <Link href="/faq" className={`type-label ${buttons.secondary}`}>
                Frequently asked questions
              </Link>
            </li>
            {RELATED_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`type-label ${buttons.tertiary}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
