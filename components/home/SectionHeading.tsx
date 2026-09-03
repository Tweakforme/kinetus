import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  id: string;
  /** Mono index rendered before the eyebrow: "01 / CATALOGUE". */
  index?: string;
  eyebrow: string;
  title: string;
};

/**
 * Section heading (Figma 41:47 / 42:62 / 43:92): mono Label eyebrow, optionally indexed
 * in the technical-documentation manner, over an H2 XL.
 */
export function SectionHeading({ id, index, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      <p className={`type-label ${styles.eyebrow}`}>
        {index && (
          <>
            <span className={`numeric ${styles.index}`}>{index}</span>{" "}
            <span aria-hidden="true" className={styles.slash}>
              /
            </span>
          </>
        )}
        {eyebrow}
      </p>
      <h2 id={id} className={`type-h2-xl ${styles.title}`}>
        {title}
      </h2>
    </div>
  );
}
