import { formatDistanceToNow } from "date-fns";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";
import { getCategories, getProperties, getResidents } from "@/lib/services/reference-data-service";
import { getViolationDetail } from "@/lib/services/dashboard-service";
import { addViolationComment, updateViolation, updateViolationStatus, uploadViolationPhoto } from "../../actions";

const statusOptions = ["open", "under_review", "warning_sent", "fine_pending", "resolved", "closed"].map((value) => ({
  value,
  label: formatLabel(value)
}));

export default async function ViolationDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const violation = await getViolationDetail(id);
  if (!violation) notFound();

  const [properties, residents, categories] = await Promise.all([getProperties(), getResidents(), getCategories()]);
  const propertyLabel = violation.properties?.address ?? "Unknown property";
  const residentLabel = violation.residents
    ? `${violation.residents.first_name} ${violation.residents.last_name}`
    : "Unassigned";

  const timeline = [
    {
      id: "created",
      title: "Violation recorded",
      description: violation.description,
      timestamp: formatDateTime(violation.created_at),
      actor: violation.created_by ? "Staff member" : undefined
    },
    ...violation.violation_comments.map((comment) => ({
      id: comment.id,
      title: "Comment added",
      description: comment.body,
      timestamp: formatDateTime(comment.created_at),
      actor: comment.profiles?.full_name ?? undefined
    }))
  ];

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={violation.violation_categories?.name ?? "Violation"}
        subtitle={`${propertyLabel} · ${residentLabel}`}
        status={violation.status}
        statusKind="violation"
        icon={ShieldCheck}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/violations">Back to list</Link>
          </Button>
        }
        timeline={timeline}
        tabs={[
          {
            id: "details",
            label: "Details",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Violation details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Property</p>
                    <p className="text-sm font-medium">{propertyLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Resident</p>
                    <p className="text-sm font-medium">{residentLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Severity</p>
                    <p className="text-sm font-medium">{formatLabel(violation.severity)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Due date</p>
                    <p className="text-sm font-medium">{formatDate(violation.due_date)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase text-muted-foreground">Description</p>
                    <p className="text-sm">{violation.description}</p>
                  </div>
                  {violation.resolved_at ? (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Resolved</p>
                      <p className="text-sm font-medium">{formatDateTime(violation.resolved_at)}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          },
          {
            id: "workflow",
            label: "Workflow",
            content: (
              <RecordForm
                title="Update status"
                submitLabel="Save status"
                action={updateViolationStatus}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: violation.status,
                    selectOptions: statusOptions
                  }
                ]}
              />
            )
          },
          {
            id: "comments",
            label: "Comments",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Add comment"
                  submitLabel="Post comment"
                  action={addViolationComment}
                  fields={[
                    { name: "violation_id", label: "Violation", type: "hidden", defaultValue: id },
                    { name: "body", label: "Comment", type: "textarea", required: true }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Thread</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {violation.violation_comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet.</p>
                    ) : (
                      violation.violation_comments.map((comment) => (
                        <div key={comment.id} className="rounded-md border p-3">
                          <p className="text-sm">{comment.body}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {comment.profiles?.full_name ?? "Staff"} · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
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
            id: "evidence",
            label: "Evidence",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Upload photo"
                  submitLabel="Upload evidence"
                  action={uploadViolationPhoto}
                  multipart
                  fields={[
                    { name: "violation_id", label: "Violation", type: "hidden", defaultValue: id },
                    { name: "caption", label: "Caption" },
                    { name: "file", label: "Photo", type: "file", required: true }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded evidence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {violation.violation_photos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No photos uploaded.</p>
                    ) : (
                      violation.violation_photos.map((photo) => (
                        <div key={photo.id} className="rounded-md border p-3 text-sm">
                          <p className="font-medium">{photo.caption ?? "Evidence photo"}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(photo.created_at)}</p>
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
                title="Edit violation"
                submitLabel="Save changes"
                action={updateViolation}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "property_id",
                    label: "Property",
                    type: "select",
                    required: true,
                    defaultValue: violation.property_id,
                    selectOptions: properties.map((p) => ({ value: p.id, label: p.label }))
                  },
                  {
                    name: "resident_id",
                    label: "Resident",
                    type: "select",
                    defaultValue: violation.resident_id ?? "",
                    selectOptions: [{ value: "", label: "None" }, ...residents.map((r) => ({ value: r.id, label: r.label }))]
                  },
                  {
                    name: "category_id",
                    label: "Category",
                    type: "select",
                    defaultValue: violation.category_id ?? "",
                    selectOptions: [{ value: "", label: "None" }, ...categories.map((c) => ({ value: c.id, label: c.label }))]
                  },
                  { name: "description", label: "Description", type: "textarea", required: true, defaultValue: violation.description },
                  {
                    name: "severity",
                    label: "Severity",
                    type: "select",
                    defaultValue: violation.severity,
                    selectOptions: ["low", "medium", "high", "critical"].map((value) => ({ value, label: formatLabel(value) }))
                  },
                  { name: "due_date", label: "Due date", type: "date", defaultValue: violation.due_date ?? "" }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
