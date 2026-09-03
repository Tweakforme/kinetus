import Link from "next/link";
import { Container } from "./Container";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_POLICY_LINKS,
  RESEARCH_USE_COPY,
  SITE_NAME,
} from "@/lib/site";
import styles from "./Footer.module.css";

/**
 * Site footer.
 *  - Arrangement: client-confirmed deck (legal/policy link list; company links).
 *  - Finish: approved Figma Footer (43:143) / Mobile footer (64:55) — tokens only.
 *  - Links point at routes built in later phases (they 404 until then); prefetch={false}
 *    keeps viewport prefetching from logging 404s. TODO: remove once the routes exist.
 *  - No business address, phone number or email is rendered — none is confirmed.
 */
export function Footer() {
  // TODO: confirm legal entity name for the copyright line with AJ/Mike before launch.
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h2 className={`type-label ${styles.heading}`}>Company</h2>
            <ul className={styles.list}>
              {FOOTER_COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} prefetch={false} className={`type-body-s ${styles.link}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h2 className={`type-label ${styles.heading}`}>Policies</h2>
            <ul className={styles.list}>
              {FOOTER_POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} prefetch={false} className={`type-body-s ${styles.link}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
