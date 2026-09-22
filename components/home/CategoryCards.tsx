import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRightIcon, ClipboardCheckIcon, DocumentIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import buttons from "@/components/ui/buttons.module.css";
import { blurPlaceholder } from "@/lib/images";
import { COLLECTION_SLUGS, HEADER_ICON_LINKS, collectionHref } from "@/lib/site";
import styles from "./CategoryCards.module.css";

/** The universal keyed render (public/products); the only product imagery on these cards. */
const RENDER_SRC = "/products/kinetus-vial-and-blank-box-cut.png";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

type CardMedia =
  | {
      kind: "render";
      /** The blends card shows the render a little larger (deck slide 4). */
      large?: boolean;
    }
  | { kind: "icon"; Icon: IconComponent };

type CategoryCard = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  /** Visually hidden suffix so repeated "View all" links stay distinct for assistive technology. */
  linkContext?: string;
  media: CardMedia;
};

/**
 * The five cards of deck slide 4. Cards 1 to 3 use the blank render; the deck's document
 * photographs on cards 4 and 5 are replaced by line icons (no fabricated document imagery).
 */
const CARDS: CategoryCard[] = [
  {
    title: "Peptides",
    description: "Browse our full selection of research-grade peptide materials.",
    href: collectionHref(COLLECTION_SLUGS.peptides),
    linkLabel: "View all",
    linkContext: "peptides",
    media: { kind: "render" },
  },
  {
    title: "Blends",
    description: "Combination peptide materials supplied in a single vial.",
    href: collectionHref(COLLECTION_SLUGS.blends),
    linkLabel: "View blends",
    media: { kind: "render", large: true },
  },
  {
    title: "Lab supplies",
    description: "Research accessories and laboratory materials.",
    href: collectionHref(COLLECTION_SLUGS.labSupplies),
    linkLabel: "View all",
    linkContext: "lab supplies",
    media: { kind: "render" },
  },
  {
    title: "Research",
    description: "Documentation, batch references and research-use resources.",
    href: collectionHref(COLLECTION_SLUGS.research),
    linkLabel: "View resources",
    media: { kind: "icon", Icon: DocumentIcon },
  },
  {
    title: "Certificate of analysis",
    description: "Batch-specific documentation, available on request.",
    href: HEADER_ICON_LINKS.documentation.href,
    linkLabel: "Request a COA",
    media: { kind: "icon", Icon: ClipboardCheckIcon },
  },
];

function CardMedia({ media, blur }: { media: CardMedia; blur: string | undefined }) {
  if (media.kind === "icon") {
    return (
      <div className={`${styles.media} ${styles.mediaIcon}`}>
        <media.Icon size={72} className={styles.icon} />
      </div>
    );
  }
  return (
    <div className={styles.media}>
      {/* Decorative: the card title names the category. */}
      <Image
        src={RENDER_SRC}
        alt=""
        fill
        sizes="(min-width: 1280px) 120px, (min-width: 1024px) 180px, (min-width: 768px) 20vw, 40vw"
        className={media.large ? `${styles.image} ${styles.imageLarge}` : styles.image}
        placeholder={blur ? "blur" : "empty"}
        blurDataURL={blur}
      />
    </div>
  );
}

/**
 * "RESEARCH MATERIALS" divider and the five category cards (deck slide 4): pale grey
 * cards with the render on the left and royal-blue condensed title, short description
 * and "VIEW ALL" link on the right. The link is stretched over the whole card so the
 * entire card is the tap target while the page carries a single link per card.
 */
export function CategoryCards() {
  const blur = blurPlaceholder(RENDER_SRC);

  return (
    <Container
      as="section"
      className={styles.section}
      aria-labelledby="home-materials-heading"
      data-reveal=""
    >
      <SectionDivider id="home-materials-heading" title="Research materials" nodes />

      <ul className={styles.grid}>
        {CARDS.map((card) => (
          <li key={card.title} className={styles.card} data-reveal="">
            <CardMedia media={card.media} blur={blur} />
            <div className={styles.text}>
              <h3 className={styles.title}>{card.title}</h3>
              <p className={styles.description}>{card.description}</p>
              <Link href={card.href} className={`${buttons.link} ${styles.cta}`}>
                {card.linkLabel}
                {card.linkContext && <span className="visually-hidden"> {card.linkContext}</span>}
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
