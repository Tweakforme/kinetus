/**
 * The one markup admin-written text supports: `**bold**`. Plain text in; a blank line
 * starts a new paragraph, a single newline is a line break, and a `**` pair on one line
 * makes what is between them bold. Nothing else is interpreted, and a `**` without a
 * partner on the same line stays as typed. Pure and dependency-free, so the storefront
 * (components/ui/RichText.tsx) and plain-text outputs share one reading of the text.
 */

export type RichSegment = { text: string; bold: boolean };
/** One line of a paragraph. */
export type RichLine = RichSegment[];
/** One paragraph: its lines, joined by line breaks. */
export type RichParagraph = RichLine[];

const MARK = "**";

/** Splits one line into plain and bold runs. */
export function parseRichLine(line: string): RichLine {
  const segments: RichLine = [];
  let literal = "";
  let position = 0;
  while (position < line.length) {
    const open = line.indexOf(MARK, position);
    const close = open === -1 ? -1 : line.indexOf(MARK, open + MARK.length);
    if (open === -1 || close === -1) {
      break;
    }
    const inner = line.slice(open + MARK.length, close);
    literal += line.slice(position, open);
    if (inner.length === 0) {
      // "****" has nothing to make bold: keep it as typed.
      literal += MARK + MARK;
    } else {
      if (literal) {
        segments.push({ text: literal, bold: false });
        literal = "";
      }
      segments.push({ text: inner, bold: true });
    }
    position = close + MARK.length;
  }
  literal += line.slice(position);
  if (literal) {
    segments.push({ text: literal, bold: false });
  }
  return segments;
}

/** Paragraphs (split on blank lines, trimmed, empty ones dropped) of lines of runs. */
export function parseRichText(text: string | null | undefined): RichParagraph[] {
  if (!text) {
    return [];
  }
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => paragraph.split("\n").map(parseRichLine));
}

/**
 * The same text without its bold marks, for places that cannot show bold (meta and
 * Open Graph descriptions, JSON-LD, card snippets, emails). Line breaks become spaces and
 * paragraphs are joined by a space, so the result is one line.
 */
export function stripBold(text: string): string {
  return parseRichText(text)
    .map((paragraph) =>
      paragraph.map((line) => line.map((segment) => segment.text).join("")).join(" "),
    )
    .join(" ");
}
