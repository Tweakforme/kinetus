import Image from "next/image";
import Link from "next/link";
import { MapleLeafIcon } from "@/components/icons/LineIcons";
import { Container } from "./Container";
import {
  CONTACT_EMAIL,
  FOOTER_COMPANY_LINKS,
  FOOTER_POLICY_LINKS,
  LOCATION,
  RESEARCH_USE_COPY,
  SITE_NAME,
  type NavLink,
} from "@/lib/site";
import { getCatalogueLinks } from "@/lib/navigation";
import styles from "./Footer.module.css";

/**
 * The full-colour horizontal logo (772 x 183, as in the header) at 56px tall, on a small
 * white panel so it renders as designed on the navy ground. The client's pack has no white
 * or single-colour version, and the flat white copy made from it lost the wordmark's
 * letterforms and the mark's modelling.
 */
const LOCKUP = { src: "/brand/kinetus-logo-horizontal.png", width: 236, height: 56 };

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
            <Link href={link.href} className={styles.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Site footer: navy ground, white text. The logo on its white panel and a two-line note
 * on top, then Catalogue / Company / Policies / Contact columns (the catalogue column
 * lists the published ranges; the rest are fixed links from lib/site.ts), then the
 * copyright line, a red maple leaf and the research-use statement under a hairline.
 * Two columns on mobile, four on desktop.
 */
export async function Footer() {
  const catalogueLinks = await getCatalogueLinks();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.top}>
          <Link href="/" className={styles.lockupLink} aria-label={`${SITE_NAME} home`}>
            <Image
              src={LOCKUP.src}
              alt={SITE_NAME}
              width={LOCKUP.width}
              height={LOCKUP.height}
              className={styles.lockup}
            />
          </Link>
          <p className={styles.note}>
            <span className={styles.noteLine}>Canadian supplier of research materials.</span>
            <span className={styles.noteLine}>{RESEARCH_USE_COPY}</span>
          </p>
        </div>

        <div className={styles.columns}>
          <FooterColumn heading="Catalogue" links={catalogueLinks} />
          <FooterColumn heading="Company" links={FOOTER_COMPANY_LINKS} />
          <FooterColumn heading="Policies" links={FOOTER_POLICY_LINKS} />

          <div className={styles.column}>
            <h2 className={`type-label ${styles.heading}`}>Contact</h2>
            <ul className={styles.list}>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.link}>
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <span className={styles.text}>{LOCATION}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.legal}>
            © {year} {SITE_NAME}
          </p>
          <MapleLeafIcon size={18} className={styles.leaf} />
          <p className={styles.legal}>{RESEARCH_USE_COPY}</p>
        </div>
      </Container>
    </footer>
  );
}
