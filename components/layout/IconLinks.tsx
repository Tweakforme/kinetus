import { HeaderSearch } from "./HeaderSearch";
import styles from "./IconLinks.module.css";

/**
 * The deck's header icon cluster (slide 4 shows search / account / cart): the inline
 * search form. Desktop only; the drawer carries search below the desktop breakpoint.
 * The cart link (CartLink) sits after the hamburger, visible at every width.
 */
export function IconLinks() {
  return (
    <div className={styles.cluster}>
      <HeaderSearch />
    </div>
  );
}
