import { ContentPage } from "@/components/content/ContentPage";
import { contentMetadata } from "@/components/content/contentMetadata";
import { shippingPolicyDocument } from "@/content/shipping-policy";

export const metadata = contentMetadata(
  shippingPolicyDocument.title,
  shippingPolicyDocument.description,
  "/shipping-policy",
);

export default function ShippingPolicyPage() {
  return <ContentPage doc={shippingPolicyDocument} />;
}
