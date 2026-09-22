import { contentMetadata } from "@/components/content/contentMetadata";
import { LEGAL_DESCRIPTION, LegalPage } from "@/components/content/LegalPage";

export const metadata = contentMetadata("Legal", LEGAL_DESCRIPTION, "/legal");

export default function LegalRoute() {
  return <LegalPage />;
}
