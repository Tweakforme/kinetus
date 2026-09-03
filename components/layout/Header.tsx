import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";
import { ResearchUseStrip } from "./ResearchUseStrip";
import { PRIMARY_NAV, SITE_NAME } from "@/lib/site";
import styles from "./Header.module.css";

/**
 * Site header.
 *  - Arrangement: client-confirmed deck (top research-use strip · logo left · nav right).
 *  - Finish: approved Figma Header (38:45) / Mobile header (55:9) — tokens only.
 *  - Nav links point at routes built in later phases (they 404 until then).
 *  - The deck's search / account / cart icons are out of scope and not carried over.
 */
export function Header() {
  return (
    <header className={styles.header}>
      <ResearchUseStrip />
      <div className={styles.bar}>
        <Container className={styles.row}>
          <Link href="/" className={styles.logoLink} aria-label={`${SITE_NAME} home`}>
            <Image
              src="/kinetus-logo.png"
              alt={SITE_NAME}
              width={1515}
              height={1038}
              sizes="(min-width: 768px) 94px, 70px"
              className={styles.logo}
              priority
            />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              {PRIMARY_NAV.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`type-label ${styles.navLink}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <MobileNav links={PRIMARY_NAV} />
        </Container>
      </div>
    </header>
  );
}
