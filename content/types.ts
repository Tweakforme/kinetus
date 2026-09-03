/**
 * Structured content for the client's legal and informational documents.
 * Text inside these structures is verbatim from the source .docx files; the shapes only
 * describe how that text is grouped (sections, lists, hard-wrapped blocks).
 */

/** A phrase inside a paragraph that links to a site route (first occurrence is linked). */
export type InlineLink = {
  phrase: string;
  href: string;
};

export type ContentBlock =
  | {
      type: "paragraph";
      text: string;
      /** Bold in the source document. */
      emphasis?: boolean;
      links?: InlineLink[];
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      /** A hard-wrapped block from the source (addresses, sign-offs), one line each. */
      type: "lines";
      lines: string[];
    };

export type ContentSection = {
  id: string;
  /** The document's own section number, e.g. "1." (null when the source is unnumbered). */
  number: string | null;
  heading: string;
  blocks: ContentBlock[];
};

export type PolicyDocument = {
  slug: string;
  title: string;
  kicker: string | null;
  dateLabel: string | null;
  date: string | null;
  /** Meta description (authored, neutral). */
  description: string;
  intro: ContentBlock[];
  sections: ContentSection[];
  closing: ContentBlock[];
  source: string;
  /** Bracketed placeholders left in the client's text, preserved exactly. */
  placeholders: string[];
};

export type FaqEntry = {
  id: string;
  question: string;
  answer: ContentBlock[];
};

export type FaqGroup = {
  id: string;
  heading: string;
  entries: FaqEntry[];
};

export type FaqDocument = {
  slug: string;
  title: string;
  intro: string;
  description: string;
  groups: FaqGroup[];
  closingHeading: string;
  closing: ContentBlock[];
  source: string;
  /** Questions from the source document that are not published, verbatim. */
  omitted: string[];
};

export type AboutSection = ContentSection & {
  /** The bold principle line, split at its sentence boundaries for display. */
  principles: string[];
  afterPrinciples: ContentBlock[];
};

export type AboutDocument = {
  slug: string;
  title: string;
  lede: string;
  description: string;
  intro: ContentBlock[];
  sections: AboutSection[];
  exploreHeading: string;
  exploreLine: string;
  closing: ContentBlock[];
  source: string;
  omitted: string[];
};
