import Link from "next/link";
import { Container } from "./Container";
import { getNavCollections } from "@/lib/collections";
import {
  buildCatalogueLinks,
  FOOTER_COMPANY_LINKS,
  FOOTER_POLICY_LINKS,
  RESEARCH_USE_COPY,
  SITE_NAME,
  type NavLink,
} from "@/lib/site";
import styles from "./Footer.module.css";

type FooterColumnProps = {
  heading: string;
  links: NavLink[];
};

function FooterColumn({ heading, links }: FooterColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={`type-label ${styles.heading}`}>{heading}</h2>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={link.prefetch === false ? false : undefined}
              className={`type-body-s ${styles.link}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Site footer.
 *  - Arrangement: client-confirmed deck (legal/policy link list; company links).
 *  - Finish: approved Figma Footer (43:143) / Mobile footer (64:55) — tokens only.
 *  - Catalogue column is database-driven (published collections, cached) per Figma
 *    column order: Catalogue · Company · Policies · Contact.
 *  - No business address, phone number or email is rendered — none is confirmed.
 */
export async function Footer() {
  const collections = await getNavCollections();
  const catalogueLinks = buildCatalogueLinks(
    collections.map((collection) => ({
      label: collection.name,
      href: `/collections/${collection.slug}`,
    })),
  );

  // TODO: confirm legal entity name for the copyright line with AJ/Mike before launch.
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.columns}>
          <FooterColumn heading="Catalogue" links={catalogueLinks} />
          <FooterColumn heading="Company" links={FOOTER_COMPANY_LINKS} />
          <FooterColumn heading="Policies" links={FOOTER_POLICY_LINKS} />

          {/* TODO: confirm public contact info with AJ/Mike — the approved frames show a
              "Contact" column (email · phone · location). Internal contact details must not
              be published; the column is omitted until a public contact method is confirmed. */}
        </div>

        <hr className={styles.rule} />

        <div className={styles.legal}>
          <p className={`type-caption ${styles.legalText}`}>{RESEARCH_USE_COPY}</p>
          <p className={`type-caption ${styles.legalText}`}>
            © {year} {SITE_NAME}
          </p>
        </div>
      </Container>
    </footer>
  );
}
