import { ContentPage } from "@/components/content/ContentPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { termsDocument } from "@/content/terms";

export const metadata = contentMetadata(termsDocument.title, termsDocument.description, "/terms");

export default function TermsPage() {
  return <ContentPage doc={termsDocument} />;
}
