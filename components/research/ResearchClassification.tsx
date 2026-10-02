import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { RESEARCH_CLASSIFICATION } from "@/lib/research-classification";
import styles from "./ResearchClassification.module.css";

/**
 * The client's Research Classification Outline on /research: one native <details> card
 * per category (icon, number and title, then the Research Material | Description table),
 * the first open and the rest collapsed. Collapsed text stays in the DOM. The wording is
 * the client's, verbatim (lib/research-classification.ts).
 */
export function ResearchClassification() {
  return (
    <Container as="section" className={styles.section} aria-labelledby="classification-heading">
      <SectionDivider id="classification-heading" title="Research Classification Outline" />
      <div className={styles.cards}>
        {RESEARCH_CLASSIFICATION.map((category, index) => (
          <details key={category.slug} className={styles.card} open={index === 0}>
            <summary className={styles.summary}>
              {/* Decorative: the icon carries the category name set beside it. */}
              <Image src={category.icon} alt="" width={64} height={64} className={styles.icon} />
              <span className={styles.heading}>
                <span className={`numeric ${styles.number}`}>{category.number}</span>
                <span className={styles.title}>{category.title}</span>
              </span>
            </summary>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Research Material</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {category.rows.map((row, rowIndex) => (
                  <tr key={`${row.material}-${rowIndex}`}>
                    <th scope="row">{row.material}</th>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))}
      </div>
    </Container>
  );
}
