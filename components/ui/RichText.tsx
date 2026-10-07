import { Fragment } from "react";
import { parseRichLine, parseRichText, type RichLine } from "@/lib/rich-text";

function Runs({ line }: { line: RichLine }) {
  return (
    <>
      {line.map((segment, index) =>
        segment.bold ? (
          <strong key={index}>{segment.text}</strong>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  );
}

type RichTextProps = {
  /** Admin- or client-written plain text; see lib/rich-text.ts for what it supports. */
  text: string | null | undefined;
  /** Class for every paragraph. */
  paragraphClassName?: string;
};

/**
 * Plain text as paragraphs: a blank line starts a new paragraph, a single newline is a
 * line break and `**text**` is bold. Built from React nodes only (never raw HTML), so
 * anything else in the text is shown exactly as typed. Renders nothing for empty text.
 * No hooks: usable from server and client components alike.
 */
export function RichText({ text, paragraphClassName }: RichTextProps) {
  return (
    <>
      {parseRichText(text).map((paragraph, index) => (
        <p key={index} className={paragraphClassName}>
          {paragraph.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              <Runs line={line} />
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

/** One line of text with `**bold**` runs and no wrapper, for list items and headings. */
export function RichInline({ text }: { text: string }) {
  return <Runs line={parseRichLine(text)} />;
}
