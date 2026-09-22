import Link from "next/link";
import type { ReactNode } from "react";
import type { InlineLink } from "@/content/types";
import styles from "./InlineText.module.css";

type InlineTextProps = {
  text: string;
  links?: InlineLink[];
};

type Match = {
  start: number;
  end: number;
  node: ReactNode;
};

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+\w/g;
const PLACEHOLDER_PATTERN = /\[[^\]]+\]/g;

/**
 * Renders verbatim client text with three presentational enrichments, none of which
 * alter the characters: route links on named phrases (first occurrence), mailto links
 * on email addresses, and a highlighted treatment on bracketed placeholders such as
 * "[INSERT WEBSITE]" that the client still has to fill in.
 */
export function InlineText({ text, links = [] }: InlineTextProps) {
  const matches: Match[] = [];

  // Longest phrases first so "Return & Refund Policy" wins over "Refund Policy".
  const byLength = [...links].sort((a, b) => b.phrase.length - a.phrase.length);
  for (const link of byLength) {
    const start = text.indexOf(link.phrase);
    if (start === -1) continue;
    const end = start + link.phrase.length;
    if (overlaps(matches, start, end)) continue;
    matches.push({
      start,
      end,
      node: (
        <Link key={`link-${start}`} href={link.href} className={styles.link}>
          {link.phrase}
        </Link>
      ),
    });
  }

  for (const match of text.matchAll(EMAIL_PATTERN)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (overlaps(matches, start, end)) continue;
    matches.push({
      start,
      end,
      node: (
        // TODO: confirm mailbox is live before launch.
        <a key={`mail-${start}`} href={`mailto:${match[0]}`} className={styles.link}>
          {match[0]}
        </a>
      ),
    });
  }

  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (overlaps(matches, start, end)) continue;
    matches.push({
      start,
      end,
      node: (
        <span key={`placeholder-${start}`} className={styles.placeholder}>
          {match[0]}
        </span>
      ),
    });
  }

  if (matches.length === 0) {
    return <>{text}</>;
  }

  matches.sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      parts.push(text.slice(cursor, match.start));
    }
    parts.push(match.node);
    cursor = match.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

function overlaps(matches: Match[], start: number, end: number): boolean {
  return matches.some((match) => start < match.end && end > match.start);
}
