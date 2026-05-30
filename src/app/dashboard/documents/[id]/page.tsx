import { FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentCategories } from "@/lib/constants";
import { formatDateTime, formatLabel } from "@/lib/format";
import { getDocumentDetail } from "@/lib/services/dashboard-service";
import { updateDocument, uploadDocumentVersion } from "../../actions";

export default async function DocumentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const document = await getDocumentDetail(id);
  if (!document) notFound();

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={document.name}
        subtitle={`${document.category} · ${formatLabel(document.visibility)} access`}
        icon={FileText}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/documents">Back to library</Link>
          </Button>
        }
        tabs={[
          {
            id: "metadata",
            label: "Metadata",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Document information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{document.category}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Visibility</p>
                    <p className="text-sm font-medium">{formatLabel(document.visibility)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDateTime(document.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Versions</p>
                    <p className="text-sm font-medium">{document.document_versions.length}</p>
                  </div>
                </CardContent>
              </Card>
            )
          },
          {
            id: "versions",
            label: "Versions",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Upload new version"
                  submitLabel="Upload version"
                  action={uploadDocumentVersion}
                  multipart
                  fields={[
                    { name: "document_id", label: "Document", type: "hidden", defaultValue: id },
                    { name: "version_label", label: "Version label", required: true, placeholder: "v2.0" },
                    { name: "file", label: "File", type: "file", required: true }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Version history</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {document.document_versions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No versions uploaded yet.</p>
                    ) : (
                      document.document_versions.map((version) => (
                        <div key={version.id} className="rounded-md border p-3">
                          <p className="text-sm font-medium">{version.version_label}</p>
                          <p className="text-xs text-muted-foreground">
                            {version.profiles?.full_name ?? "Staff"} · {formatDateTime(version.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          },
          {
            id: "edit",
            label: "Edit",
            content: (
              <RecordForm
                title="Edit document"
                submitLabel="Save document"
                action={updateDocument}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  { name: "name", label: "Name", required: true, defaultValue: document.name },
                  {
                    name: "category",
                    label: "Category",
                    type: "select",
                    required: true,
                    defaultValue: document.category,
                    selectOptions: documentCategories.map((category) => ({ value: category, label: category }))
                  },
                  {
                    name: "visibility",
                    label: "Visibility",
                    type: "select",
                    defaultValue: document.visibility,
                    selectOptions: [
                      { value: "residents", label: "Residents" },
                      { value: "board", label: "Board" },
                      { value: "staff", label: "Staff" },
                      { value: "public", label: "Public" }
                    ]
                  }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
