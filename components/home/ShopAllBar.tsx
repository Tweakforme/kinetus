import Link from "next/link";
import { CartIcon, ChevronRightIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import styles from "./ShopAllBar.module.css";

type ShopAllBarProps = {
  /** Spacing hook for the page that places the bar. */
  className?: string;
};

/**
 * The wide SHOP ALL PRODUCTS call to action under the homepage hero (the client's
 * homepage mockup): a teal bar with the cart icon, a hairline, the label over a
 * letterspaced line, and a circled arrow, linking to the full catalogue. From 1024px it
 * overlaps the hero's lower edge as the mockup shows.
 */
export function ShopAllBar({ className }: ShopAllBarProps) {
  return (
    <Container className={className ? `${styles.wrap} ${className}` : styles.wrap}>
      <Link href="/products" className={styles.bar}>
        <CartIcon size={40} className={styles.cart} />
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.text}>
          <span className={styles.title}>Shop all products</span>
          <span className={styles.sub}>Explore the complete research catalogue</span>
        </span>
        <span className={styles.arrow} aria-hidden="true">
          <ChevronRightIcon size={22} />
        </span>
      </Link>
    </Container>
  );
}
