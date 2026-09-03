import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
};

/** Homepage section heading (Figma 41:47 / 42:62 / 43:92): Label eyebrow over an H2. */
export function SectionHeading({ id, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      <p className={`type-label ${styles.eyebrow}`}>{eyebrow}</p>
      <h2 id={id} className={`type-h2 ${styles.title}`}>
        {title}
      </h2>
    </div>
  );
}
