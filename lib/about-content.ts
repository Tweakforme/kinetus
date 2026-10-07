/**
 * The About page's six value sections, one per badge, in page order. Copy is the client's,
 * verbatim (supplied by Mike, 2026-10-07): do not paraphrase. `**text**` is bold, rendered by
 * components/ui/RichText.tsx. Each `id` is the anchor its badge links to.
 */

export type AboutBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

export type AboutValueSection = {
  /** Anchor on /about; the badge with the same `id` links here. */
  id: string;
  heading: string;
  subheading: string | null;
  blocks: AboutBlock[];
};

export const ABOUT_VALUE_SECTIONS: AboutValueSection[] = [
  {
    id: "science-driven",
    heading: "About Kinetus BioLabs",
    subheading: "Science Driven. Quality Focused.",
    blocks: [
      {
        type: "paragraph",
        text: "At **Kinetus BioLabs**, we believe scientific research deserves materials that researchers can approach with confidence.",
      },
      {
        type: "paragraph",
        text: "Kinetus was created with a straightforward objective: to build a Canadian research-focused brand centered on **quality, transparency, consistency, and scientific integrity**. Our focus is on providing carefully sourced research materials supported by clear product information and appropriate analytical documentation.",
      },
    ],
  },
  {
    id: "built-around-research",
    heading: "Built Around Research",
    subheading: null,
    blocks: [
      {
        type: "paragraph",
        text: "Research is at the heart of everything we do. From peptides and research blends to laboratory supplies and supporting resources, our goal is to make it easier for researchers to access the materials they need through a professional, reliable platform.",
      },
      {
        type: "paragraph",
        text: "We believe quality isn't simply a statement on a label. It should be supported by **documentation, traceability, consistency, and a commitment to responsible sourcing**.",
      },
    ],
  },
  {
    id: "commitment-to-quality",
    heading: "Our Commitment to Quality",
    subheading: null,
    blocks: [
      {
        type: "paragraph",
        text: "Kinetus BioLabs is committed to maintaining high standards throughout the research-material supply chain. We place particular importance on:",
      },
      {
        type: "list",
        items: [
          "**Quality-focused sourcing**",
          "**Batch-specific documentation**",
          "**Analytical transparency**",
          "**Consistent product presentation**",
          "**Professional packaging and fulfillment**",
          "**Clear research-use information**",
          "**Responsive customer support**",
        ],
      },
      {
        type: "paragraph",
        text: "Where analytical documentation is available, we aim to make relevant information accessible so researchers can make informed decisions about the materials they are evaluating.",
      },
    ],
  },
  {
    id: "proudly-canadian",
    heading: "Proudly Canadian",
    subheading: null,
    blocks: [
      {
        type: "paragraph",
        text: "Kinetus BioLabs is a Canadian-focused research brand built with the Canadian research community in mind.",
      },
      {
        type: "paragraph",
        text: "We understand that researchers need more than a product catalog. They need a supplier that values **reliability, communication, documentation, and accountability**. Our goal is to establish long-term relationships with researchers and organizations who share that commitment to scientific standards.",
      },
    ],
  },
  {
    id: "our-mission",
    heading: "Our Mission",
    subheading: null,
    blocks: [
      { type: "paragraph", text: "Our mission is simple:" },
      {
        type: "paragraph",
        text: "**To provide researchers with quality-focused research materials, transparent information, and dependable service—while continuously raising the standard for professionalism within the research-material marketplace.**",
      },
    ],
  },
  {
    id: "research-with-confidence",
    heading: "Research With Confidence",
    subheading: null,
    blocks: [
      {
        type: "paragraph",
        text: "At Kinetus BioLabs, we don't believe in cutting corners. We believe in building a brand around the fundamentals that matter: **quality, transparency, consistency, and trust.**",
      },
      {
        type: "paragraph",
        text: "As Kinetus grows, our commitment will remain the same—to support legitimate scientific research with a professional platform and a relentless focus on doing things the right way.",
      },
    ],
  },
];

/** Sign-off after the last section: the name in bold, the tagline in italics. */
export const ABOUT_SIGN_OFF = {
  name: "Kinetus BioLabs",
  tagline: "Precision Science. Analytical Confidence.",
};
