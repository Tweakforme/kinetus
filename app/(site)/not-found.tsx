import { NotFoundContent, notFoundMetadata } from "@/components/layout/NotFoundContent";

export const metadata = notFoundMetadata;

/** notFound() from a public page: rendered inside the (site) layout's chrome. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
