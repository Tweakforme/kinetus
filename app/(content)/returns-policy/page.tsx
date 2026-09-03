import { ContentPage } from "@/components/content/ContentPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { returnsPolicyDocument } from "@/content/returns-policy";

export const metadata = contentMetadata(
  returnsPolicyDocument.title,
  returnsPolicyDocument.description,
  "/returns-policy",
);

export default function ReturnsPolicyPage() {
  return <ContentPage doc={returnsPolicyDocument} />;
}
