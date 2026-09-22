import { AboutPage } from "@/components/content/AboutPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { aboutDocument } from "@/content/about";

export const metadata = contentMetadata("About", aboutDocument.description, "/about");

export default function AboutRoute() {
  return <AboutPage doc={aboutDocument} />;
}
