import { FileText } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getDocumentRows } from "@/lib/services/dashboard-service";
import { createDocument, uploadDocumentVersion } from "../actions";

export default async function DocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getDocumentRows();
  return (
    <ModulePage
      title="Documents"
      description="Upload, search, version, download, and permission community documents including CC&Rs, bylaws, meeting minutes, financial documents, rules, and guidelines."
      icon={FileText}
      action="Upload document"
      columns={["name", "category", "version", "access"]}
      rows={rows}
      panels={["Version history", "Access permissions", "Secure storage"]}
      message={params.message}
      error={params.error}
      form={
        <>
          <RecordForm
            title="Create document record"
            submitLabel="Save document"
            action={createDocument}
            fields={[
              { name: "name", label: "Document name", required: true },
              { name: "category", label: "Category", required: true },
              { name: "visibility", label: "Visibility", placeholder: "residents", defaultValue: "residents" }
            ]}
          />
          <RecordForm
            title="Upload version"
            submitLabel="Upload file"
            action={uploadDocumentVersion}
            fields={[
              { name: "document_id", label: "Document UUID", required: true },
              { name: "version_label", label: "Version label", placeholder: "v2", required: true },
              { name: "file", label: "Document file", type: "file", required: true }
            ]}
          />
        </>
      }
    />
  );
}
