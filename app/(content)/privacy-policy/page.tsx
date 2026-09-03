import { ContentPage } from "@/components/content/ContentPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { privacyPolicyDocument } from "@/content/privacy-policy";

export const metadata = contentMetadata(
  privacyPolicyDocument.title,
  privacyPolicyDocument.description,
  "/privacy-policy",
);

export default function PrivacyPolicyPage() {
  return <ContentPage doc={privacyPolicyDocument} />;
}
