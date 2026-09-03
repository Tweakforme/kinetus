import { ContactPage } from "@/components/content/ContactPage";
import { contentMetadata } from "@/components/content/contentMetadata";

export const metadata = contentMetadata(
  "Contact",
  "Contact the Kinetus BioLabs team by email about products, documentation, orders or research applications.",
  "/contact",
);

export default function ContactRoute() {
  return <ContactPage />;
}
