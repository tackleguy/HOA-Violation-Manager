import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { LegalLayout } from "@/components/legal/legal-layout";
import { PRIVACY_POLICY } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Privacy Policy | HOAFlow",
  description: PRIVACY_POLICY.description
};

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <LegalDocumentView document={PRIVACY_POLICY} />
    </LegalLayout>
  );
}
