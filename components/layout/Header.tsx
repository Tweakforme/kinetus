import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";
import { ResearchUseStrip } from "./ResearchUseStrip";
import logo from "@/public/kinetus-logo.png";
import { getNavCollections } from "@/lib/collections";
import { buildPrimaryNav, SITE_NAME } from "@/lib/site";
import styles from "./Header.module.css";

/**
 * Site header.
 *  - Arrangement: client-confirmed deck (top research-use strip · logo left · nav right,
 *    catalogue entries as top-level items).
 *  - Finish: approved Figma Header (38:45) / Mobile header (55:9) — tokens only.
 *  - Nav = published collections (cached, display order) · Contact. View all products,
 *    About and FAQ live in the footer. Links to unbuilt routes carry prefetch={false}.
 *  - The deck's search and account icons and its acquisition controls are out of scope.
 */
export async function Header() {
  const collections = await getNavCollections();
  const nav = buildPrimaryNav(
    collections.map((collection) => ({
      label: collection.name,
      href: `/collections/${collection.slug}`,
    })),
  );

  return (
    <header className={styles.header}>
      <ResearchUseStrip />
      <div className={styles.bar}>
        <Container className={styles.row}>
          <Link href="/" className={styles.logoLink} aria-label={`${SITE_NAME} home`}>
            <Image
              src={logo}
              alt={SITE_NAME}
              sizes="(min-width: 768px) 94px, 70px"
              className={styles.logo}
              placeholder="blur"
              priority
            />
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <ul className={styles.navList}>
              {nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={link.prefetch === false ? false : undefined}
                    className={`type-label ${styles.navLink}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <MobileNav links={nav} />
        </Container>
      </div>
    </header>
  );
}
