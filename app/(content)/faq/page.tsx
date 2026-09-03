import { FaqPage } from "@/components/content/FaqPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { faqDocument } from "@/content/faq";

export const metadata = contentMetadata("FAQ", faqDocument.description, "/faq");

export default function FaqRoute() {
  return <FaqPage doc={faqDocument} />;
}
