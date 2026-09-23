import type { ReactNode } from "react";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { AGE_GATE_SCRIPT, SITE_CONTENT_ID } from "@/lib/age-gate";
import { AgeGate } from "./AgeGate";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ResearchUseBand } from "./ResearchUseBand";

/**
 * The public site's shell: the age gate's inline script, then header, main, research-use
 * band and footer (all served in full to every visitor and crawler), the age gate
 * overlay, site JSON-LD and the scroll-reveal observer. Rendered by app/(site)/layout.tsx and by the root not-found page
 * (unmatched URLs render outside the (site) group). The admin has its own shell.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Before any content: decides, pre-paint, whether the age overlay covers the page. */}
      <script dangerouslySetInnerHTML={{ __html: AGE_GATE_SCRIPT }} />
      <div id={SITE_CONTENT_ID}>
        <Header />
        <main id="main-content">{children}</main>
        <ResearchUseBand />
        <Footer />
      </div>
      <AgeGate />
      <SiteJsonLd />
      <RevealObserver />
    </>
  );
}
