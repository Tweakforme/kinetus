import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { HexMesh } from "@/components/decor/HexMesh";
import {
  EnvelopeIcon,
  FlaskIcon,
  InfoIcon,
  MapleLeafIcon,
  MicroscopeIcon,
  ShieldCheckIcon,
} from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { PAGE_HERO_PHOTOS, PageHero } from "@/components/ui/PageHero";
import buttons from "@/components/ui/buttons.module.css";
import { SectionDivider } from "@/components/ui/SectionDivider";
import type { AboutDocument } from "@/content/types";
import { blurPlaceholder } from "@/lib/images";
import { canonicalUrl } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, CONTACT_EMAIL, CONTACT_LINK, LOCATION, SITE_NAME } from "@/lib/site";
import { ContentBlocks } from "./ContentBlocks";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";
import styles from "./AboutPage.module.css";

type AboutPageProps = {
  doc: AboutDocument;
};

type IconComponent = ComponentType<{ size?: number; className?: string }>;

/** The client's lockup with tagline (slide 19 opens on the logo). */
const LOCKUP = { src: "/brand/kinetus-logo-lockup.png", width: 772, height: 184 };

/** Welcome copy, verbatim from the approved deck (slide 19). */
const WELCOME =
  "Welcome to Kinetus BioLabs. We are a proudly Canadian company dedicated to supplying the highest quality research peptides to the scientific community, academic institutions, and independent researchers across Canada.";

/** Research notice, verbatim from the approved deck (slide 19). */
const RESEARCH_NOTICE =
  "All products sold by Kinetus BioLabs are intended strictly for laboratory research purposes only. These compounds are not for human consumption, medical use, or veterinary use. Products are sold exclusively to qualified researchers and laboratories.";

/** The deck's four-icon row (slide 19), labels verbatim. */
const PILLARS: { Icon: IconComponent; label: string }[] = [
  { Icon: MapleLeafIcon, label: "Proudly Canadian" },
  { Icon: ShieldCheckIcon, label: "Quality Assured" },
  { Icon: MicroscopeIcon, label: "Research Focused" },
  { Icon: InfoIcon, label: "Research Use Only" },
];

/**
 * The client's six value badges ("About us Graphics"), each titled as printed on the badge
 * ("Science driven symbol.png" reads "Science Driven. Quality Focused."). `copy` is the
 * client's text under each badge: none has been supplied, and nothing is shown until it is.
 */
const VALUES: { src: string; width: number; height: number; title: string; copy: string | null }[] =
  [
    {
      src: "/images/about/built-around-research.webp",
      width: 192,
      height: 192,
      title: "Built Around Research",
      copy: null,
    },
    {
      src: "/images/about/commitment-to-quality.webp",
      width: 192,
      height: 192,
      title: "Commitment to Quality",
      copy: null,
    },
    {
      src: "/images/about/our-mission.webp",
      width: 192,
      height: 192,
      title: "Our Mission",
      copy: null,
    },
    {
      src: "/images/about/proudly-canadian.webp",
      width: 192,
      height: 192,
      title: "Proudly Canadian",
      copy: null,
    },
    {
      src: "/images/about/research-with-confidence.webp",
      width: 192,
      height: 192,
      title: "Research with Confidence",
      copy: null,
    },
    {
      src: "/images/about/science-driven-symbol.webp",
      width: 192,
      height: 160,
      title: "Science Driven. Quality Focused.",
      copy: null,
    },
  ];

/** Badges are shown at 96px wide at most. */
const VALUE_BADGE_WIDTH = 96;

const EXPLORE_LINKS = [
  { ...ALL_PRODUCTS_LINK, primary: true },
  { label: "Frequently asked questions", href: "/faq", primary: false },
  { ...CONTACT_LINK, primary: false },
];

/**
 * About (deck slide 19): the welcome copy beside a ghosted hex mesh and the four-icon
 * row, the client's six value badges with the Product Information poster, then the
 * client's "Why Choose Kinetus BioLabs" document verbatim (minus the comparison table)
 * under the four anchors the navigation links to.
 */
export function AboutPage({ doc }: AboutPageProps) {
  const lockupBlur = blurPlaceholder(LOCKUP.src);

  return (
    <article className={`${layout.page} ${styles.page}`}>
      <PageHero
        variant="category"
        eyebrow="About Us"
        headline={`About ${SITE_NAME}`}
        headingId="about-heading"
        paragraph={doc.lede}
        features={[]}
        backgroundImage={PAGE_HERO_PHOTOS.about}
      />

      <section
        id="our-story"
        className={styles.story}
        aria-labelledby="our-story-heading"
        data-reveal=""
      >
        <Container className={styles.storyInner}>
          <div className={styles.storyCopy}>
            <h2 id="our-story-heading" className="visually-hidden">
              Our story
            </h2>
            <Image
              src={LOCKUP.src}
              alt={SITE_NAME}
              width={LOCKUP.width}
              height={LOCKUP.height}
              sizes="(min-width: 1024px) 320px, 240px"
              className={styles.lockup}
              placeholder={lockupBlur ? "blur" : "empty"}
              blurDataURL={lockupBlur}
            />
            <p className={styles.welcome}>{WELCOME}</p>
            <hr className={styles.rule} />
            <div className={styles.notice}>
              <FlaskIcon size={56} className={styles.flask} />
              <p className={styles.noticeText}>{RESEARCH_NOTICE}</p>
            </div>
            <p className={styles.emailRow}>
              <span className={styles.emailIcon} aria-hidden="true">
                <EnvelopeIcon size={28} />
              </span>
              <span className={styles.emailLabel}>Email:</span>
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.emailLink}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div className={styles.storyAside}>
            <HexMesh className={styles.storyMesh} cell={34} strokeWidth={1.5} />
            <ul className={styles.pillars} aria-label="Company statements">
              {PILLARS.map(({ Icon, label }) => (
                <li key={label} className={styles.pillar}>
                  <Icon size={48} className={styles.pillarIcon} />
                  <span className={styles.pillarLabel}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section
        id="values"
        className={styles.values}
        aria-labelledby="values-heading"
        data-reveal=""
      >
        <Container>
          <h2 id="values-heading" className="visually-hidden">
            Values
          </h2>
          <ul className={styles.valueGrid}>
            {VALUES.map((value) => (
              <li key={value.title} className={styles.value}>
                {/* Decorative: the badge repeats the title set beneath it. */}
                <Image
                  src={value.src}
                  alt=""
                  width={VALUE_BADGE_WIDTH}
                  height={Math.round((VALUE_BADGE_WIDTH * value.height) / value.width)}
                  className={styles.valueBadge}
                />
                <h3 className={styles.valueTitle}>{value.title}</h3>
                {value.copy && <p className={styles.valueCopy}>{value.copy}</p>}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {doc.sections.map((section, index) => {
        const id = index === 0 ? "quality-standards" : section.id;
        return (
          <section
            key={section.id}
            id={id}
            className={styles.quality}
            aria-labelledby={`${id}-heading`}
            data-reveal=""
          >
            <Container className={styles.qualityInner}>
              <SectionDivider id={`${id}-heading`} title={section.heading} />

              <div className={`${layout.blocks} ${styles.centred}`}>
                <ContentBlocks blocks={section.blocks} />
              </div>

              <ol className={styles.principles}>
                {section.principles.map((principle, principleIndex) => (
                  <li key={principle} className={styles.principle}>
                    <span className={`numeric ${styles.principleIndex}`} aria-hidden="true">
                      {String(principleIndex + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.principleText}>{principle}</span>
                  </li>
                ))}
              </ol>

              <div className={`${layout.blocks} ${styles.centred}`}>
                <ContentBlocks blocks={section.afterPrinciples} />
              </div>
            </Container>
          </section>
        );
      })}

      <section
        id="why-choose-kinetus"
        className={styles.why}
        aria-labelledby="why-choose-kinetus-heading"
        data-reveal=""
      >
        <Container className={styles.whyInner}>
          <SectionDivider id="why-choose-kinetus-heading" title={doc.title} />

          <div className={styles.whyGrid}>
            <div className={`${layout.blocks} ${styles.whyCopy}`}>
              <ContentBlocks blocks={doc.intro} />
            </div>

            <div className={styles.explore}>
              <h3 className={`type-h3 ${styles.exploreHeading}`}>{doc.exploreHeading}</h3>
              <p className={styles.exploreLine}>{doc.exploreLine}</p>
              <ul className={styles.exploreLinks}>
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={link.primary ? buttons.solid : buttons.outline}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="proudly-canadian"
        className={styles.canada}
        aria-labelledby="proudly-canadian-heading"
        data-reveal=""
      >
        <div className={styles.canadaBackdrop} aria-hidden="true">
          <HexMesh className={styles.canadaMesh} cell={30} />
        </div>
        <Container className={styles.canadaInner}>
          <MapleLeafIcon size={64} className={styles.canadaLeaf} />
          <h2 id="proudly-canadian-heading" className={`type-section ${styles.canadaTitle}`}>
            Proudly Canadian
          </h2>
          <p className={styles.canadaLocation}>Based in {LOCATION}</p>
          <div className={styles.canadaCopy}>
            <ContentBlocks blocks={doc.closing} />
          </div>
        </Container>
      </section>

      <ContentJsonLd
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "About", url: canonicalUrl(`/${doc.slug}`) },
        ]}
      />
    </article>
  );
}
