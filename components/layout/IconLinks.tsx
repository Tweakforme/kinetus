import Link from "next/link";
import { DocumentIcon } from "@/components/icons/LineIcons";
import { HEADER_ICON_LINKS } from "@/lib/site";
import { HeaderSearch } from "./HeaderSearch";
import styles from "./IconLinks.module.css";

/**
 * The deck's header icon cluster (slide 4 shows search / account / cart): search (inline
 * form) and batch documentation. Desktop only; the drawer carries both below the desktop
 * breakpoint. The cart link (CartLink) sits after the hamburger, visible at every width.
 */
export function IconLinks() {
  return (
    <div className={styles.cluster}>
      <HeaderSearch />

      <Link href={HEADER_ICON_LINKS.documentation.href} className={styles.iconLink}>
        <DocumentIcon size={26} />
        <span className="visually-hidden">{HEADER_ICON_LINKS.documentation.label}</span>
      </Link>
    </div>
  );
}
