import { NotFoundContent, notFoundMetadata } from "@/components/layout/NotFoundContent";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata = notFoundMetadata;

/**
 * Unmatched URLs render here, inside the root layout only (outside the (site) group), so
 * this page supplies the site chrome itself.
 */
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
