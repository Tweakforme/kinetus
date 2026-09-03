import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { HeaderNav } from "./HeaderNav";
import { UtilityBar } from "./UtilityBar";
import logo from "@/public/kinetus-logo.png";
import { getNavCollections } from "@/lib/collections";
import { buildPrimaryNav, SITE_NAME } from "@/lib/site";
import styles from "./Header.module.css";

/**
 * Site header.
 *  - Arrangement: client-confirmed deck — utility bar, then logo left and dropdown
 *    navigation right (each collection is a dropdown listing its products; Contact is a
 *    plain link).
 *  - Finish: approved Figma Header (38:45) / Mobile header (55:9) — tokens only.
 *  - Data: published collections with products via the cached getNavCollections.
 *  - The deck's search and account icons and its acquisition controls are out of scope.
 */
export async function Header() {
  const collections = await getNavCollections();
  const items = buildPrimaryNav(collections);

  return (
    <header className={styles.header}>
      <UtilityBar />
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

          <HeaderNav items={items} />
        </Container>
      </div>
    </header>
  );
}
