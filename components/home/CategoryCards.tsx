import { CollectionKind } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRightIcon, ClipboardCheckIcon, DocumentIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { SectionDivider } from "@/components/ui/SectionDivider";
import buttons from "@/components/ui/buttons.module.css";
import { blurPlaceholder } from "@/lib/images";
import { getAllCollections } from "@/lib/collections";
import { COLLECTION_SLUGS, HEADER_ICON_LINKS, RESEARCH_LINK, collectionHref } from "@/lib/site";
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

/** Ranges that show their render a little larger (deck slide 4 blends card). */
const LARGE_RENDER_SLUGS: string[] = [COLLECTION_SLUGS.blends];

/**
 * The fixed cards after the ranges. The deck's document photographs are replaced by line
 * icons (no fabricated document imagery).
 */
const FIXED_CARDS: CategoryCard[] = [
  {
    title: "Research",
    description: "Research material categories and research-use resources.",
    href: RESEARCH_LINK.href,
    linkLabel: "View research",
    media: { kind: "icon", Icon: DocumentIcon },
  },
  {
    title: "Test reports",
    description: "Third-party test reports, hosted by the testing provider.",
    href: HEADER_ICON_LINKS.documentation.href,
    linkLabel: "View test reports",
    media: { kind: "icon", Icon: ClipboardCheckIcon },
  },
];

/**
 * The deck's slide 4 cards: one per published range (name and description from the
 * catalogue, so a renamed or unpublished range follows), then Research and Test reports.
 */
async function getCards(): Promise<CategoryCard[]> {
  const ranges = await getAllCollections(CollectionKind.RANGE);
  const rangeCards = ranges.map((range) => ({
    title: range.name,
    description: range.description ?? `Browse the ${range.name} range.`,
    href: collectionHref(range.slug),
    linkLabel: "View all",
    linkContext: range.name,
    media: { kind: "render", large: LARGE_RENDER_SLUGS.includes(range.slug) } as const,
  }));
  return [...rangeCards, ...FIXED_CARDS];
}

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
 * "RESEARCH MATERIALS" divider and the range cards (deck slide 4): pale grey
 * cards with the render on the left and royal-blue condensed title, short description
 * and "VIEW ALL" link on the right. The link is stretched over the whole card so the
 * entire card is the tap target while the page carries a single link per card.
 */
export async function CategoryCards() {
  const cards = await getCards();
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
        {cards.map((card) => (
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
