import { Building2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatLabel } from "@/lib/format";
import { getArchitecturalDetail } from "@/lib/services/dashboard-service";
import { updateArchitecturalStatus, uploadArchitecturalFile } from "../../actions";

const statusOptions = ["submitted", "under_review", "board_review", "approved", "rejected"].map((value) => ({
  value,
  label: formatLabel(value)
}));

export default async function ArchitecturalDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const request = await getArchitecturalDetail(id);
  if (!request) notFound();

  const propertyLabel = request.properties?.address ?? "Unknown property";
  const residentLabel = request.residents ? `${request.residents.first_name} ${request.residents.last_name}` : "Unassigned";

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={request.title}
        subtitle={`${propertyLabel} · ${residentLabel}`}
        status={request.status}
        statusKind="request"
        icon={Building2}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/architecture">Back to list</Link>
          </Button>
        }
        tabs={[
          {
            id: "details",
            label: "Details",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Request details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Description</p>
                    <p className="text-sm">{request.description ?? "No description provided."}</p>
                  </div>
                  {request.decision_notes ? (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Decision notes</p>
                      <p className="text-sm">{request.decision_notes}</p>
                    </div>
                  ) : null}
                  {request.decided_at ? (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Decided</p>
                      <p className="text-sm">{formatDateTime(request.decided_at)}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          },
          {
            id: "workflow",
            label: "Approval",
            content: (
              <RecordForm
                title="Update decision"
                submitLabel="Save decision"
                action={updateArchitecturalStatus}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: request.status,
                    selectOptions: statusOptions
                  },
                  { name: "decision_notes", label: "Decision notes", type: "textarea", defaultValue: request.decision_notes ?? "" }
                ]}
              />
            )
          },
          {
            id: "files",
            label: "Files",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Upload file"
                  submitLabel="Upload file"
                  action={uploadArchitecturalFile}
                  multipart
                  fields={[
                    { name: "request_id", label: "Request", type: "hidden", defaultValue: id },
                    { name: "file", label: "Attachment", type: "file", required: true }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {request.architectural_request_files.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No files uploaded.</p>
                    ) : (
                      request.architectural_request_files.map((file) => (
                        <div key={file.id} className="rounded-md border p-3 text-sm">
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(file.created_at)}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
