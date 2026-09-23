import type { Metadata } from "next";
import { ListingPage } from "@/components/collection/ListingPage";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { canonicalUrl } from "@/lib/seo";
import { RESEARCH_USE_COPY, SITE_NAME } from "@/lib/site";

const TITLE = "Research";
const DESCRIPTION = `Research material categories in the ${SITE_NAME} catalogue. ${RESEARCH_USE_COPY}`;
const canonical = canonicalUrl("/research");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    url: canonical,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: canonicalUrl("/kinetus-logo.png"), alt: SITE_NAME }],
  },
};

const INTRO =
  "The catalogue is grouped into research material categories. Choose a category to see the materials in it; a material can appear in more than one category.";

/**
 * /research, the Research Area. The client's plan: "the Categories page at the top and
 * the information outlined in the word document below it". The categories are here; the
 * section below them is intentionally empty.
 */
export default function ResearchPage() {
  return (
    <ListingPage padTop>
      <ShopByCategory
        headingId="research-heading"
        as="h1"
        title="Research Material Categories"
        intro={
          <>
            <p className="type-body">{INTRO}</p>
            <p className="type-body-s">{RESEARCH_USE_COPY}</p>
          </>
        }
      />

      {/*
        CLIENT COPY PENDING. The client asked for the content of "Research Tab/
        Classification Outline.docx" to appear here. It cannot be published: it describes
        what these materials do in an organism (mechanism of action), which the content
        rules forbid. This section stays empty until the client supplies compliant copy,
        or approves the outline through his own legal review.
      */}
    </ListingPage>
  );
}
