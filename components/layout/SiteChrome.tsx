import type { ReactNode } from "react";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { ResearchUseBand } from "./ResearchUseBand";

/**
 * The public site's shell: header, main, research-use band, footer, site JSON-LD and the
 * scroll-reveal observer. Rendered by app/(site)/layout.tsx and by the root not-found page
 * (unmatched URLs render outside the (site) group). The admin has its own shell.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <ResearchUseBand />
      <Footer />
      <SiteJsonLd />
      <RevealObserver />
    </>
  );
}
