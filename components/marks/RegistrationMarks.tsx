import styles from "./RegistrationMarks.module.css";

type RegistrationMarksProps = {
  /** Place the marks just outside the parent's corners instead of on them. */
  outset?: boolean;
};

/**
 * Four L-shaped corner marks in the hairline colour: technical-drawing registration
 * vocabulary. The parent must be `position: relative`; when `outset`, the parent must not
 * clip its overflow.
 */
export function RegistrationMarks({ outset = false }: RegistrationMarksProps) {
  const className = outset ? `${styles.marks} ${styles.outset}` : styles.marks;
  return (
    <span className={className} aria-hidden="true">
      <span className={`${styles.mark} ${styles.topLeft}`} />
      <span className={`${styles.mark} ${styles.topRight}`} />
      <span className={`${styles.mark} ${styles.bottomLeft}`} />
      <span className={`${styles.mark} ${styles.bottomRight}`} />
    </span>
  );
}
