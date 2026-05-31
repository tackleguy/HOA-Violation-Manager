import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { LegalLayout } from "@/components/legal/legal-layout";
import { TERMS_OF_SERVICE } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Terms of Service | HOAFlow",
  description: TERMS_OF_SERVICE.description
};

export default function TermsPage() {
  return (
    <LegalLayout>
      <LegalDocumentView document={TERMS_OF_SERVICE} />
    </LegalLayout>
  );
}
