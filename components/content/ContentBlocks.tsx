import { Fragment } from "react";
import type { ContentBlock } from "@/content/types";
import { InlineText } from "./InlineText";
import styles from "./ContentBlocks.module.css";

type ContentBlocksProps = {
  blocks: ContentBlock[];
};

/** The client's sign-off line appears at the foot of several documents. */
const TAGLINE = "Research Materials. Quality. Documentation. Transparency.";

/**
 * Renders a run of verbatim content blocks: paragraphs (bold in the source, and
 * "Important:" notices, wrapped in <strong> at medium weight), lists, and hard-wrapped
 * lines. Nothing here alters the client's characters.
 */
export function ContentBlocks({ blocks }: ContentBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={index} className={`type-body ${styles.list}`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "lines") {
          return (
            <p key={index} className={`type-body ${styles.lines}`}>
              {block.lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  <span className={line === TAGLINE ? styles.tagline : undefined}>
                    <InlineText text={line} />
                  </span>
                </Fragment>
              ))}
            </p>
          );
        }

        if (block.text === TAGLINE) {
          return (
            <p key={index} className={`type-body-s ${styles.tagline}`}>
              {block.text}
            </p>
          );
        }

        const emphasis = block.emphasis || block.text.startsWith("Important:");
        return (
          <p key={index} className={`type-body ${styles.paragraph}`}>
            {emphasis ? (
              <strong className={styles.emphasis}>
                <InlineText text={block.text} links={block.links} />
              </strong>
            ) : (
              <InlineText text={block.text} links={block.links} />
            )}
          </p>
        );
      })}
    </>
  );
}
