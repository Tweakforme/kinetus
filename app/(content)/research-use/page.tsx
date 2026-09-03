import { ContentPage } from "@/components/content/ContentPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { researchUseDocument } from "@/content/research-use";

export const metadata = contentMetadata(
  researchUseDocument.title,
  researchUseDocument.description,
  "/research-use",
);

export default function ResearchUsePage() {
  return <ContentPage doc={researchUseDocument} />;
}
