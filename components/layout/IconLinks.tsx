import Link from "next/link";
import { DocumentIcon, EnvelopeIcon } from "@/components/icons/LineIcons";
import { HEADER_ICON_LINKS } from "@/lib/site";
import { HeaderSearch } from "./HeaderSearch";
import styles from "./IconLinks.module.css";

/**
 * The deck's header icon cluster (slide 4 shows search / account / cart) with the site's
 * three slots: search (inline form), batch documentation and enquiries. Desktop only; the
 * drawer carries the same three below the desktop breakpoint.
 */
export function IconLinks() {
  return (
    <div className={styles.cluster}>
      <HeaderSearch />

      <Link href={HEADER_ICON_LINKS.documentation.href} className={styles.iconLink}>
        <DocumentIcon size={26} />
        <span className="visually-hidden">{HEADER_ICON_LINKS.documentation.label}</span>
      </Link>

      <Link href={HEADER_ICON_LINKS.enquire.href} className={styles.iconLink}>
        <EnvelopeIcon size={26} />
        <span className="visually-hidden">{HEADER_ICON_LINKS.enquire.label}</span>
      </Link>
    </div>
  );
}
