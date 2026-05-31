import { formatDistanceToNow } from "date-fns";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCents } from "@/lib/utils/currency";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";
import { getCategories, getProperties, getResidents } from "@/lib/services/reference-data-service";
import {
  getViolationHearings,
  getViolationLinkedFines,
  getViolationNotices,
  getViolationStatusHistory
} from "@/lib/services/violation-workflow-service";
import { getViolationDetail } from "@/lib/services/dashboard-service";
import { violationStatusOptions } from "@/lib/violation-workflow";
import {
  addViolationComment,
  createViolationHearing,
  createViolationNotice,
  updateViolation,
  updateViolationStatus,
  uploadViolationPhoto
} from "../../actions";

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

  const [properties, residents, categories, notices, hearings, statusHistory, fines] = await Promise.all([
    getProperties(),
    getResidents(),
    getCategories(),
    getViolationNotices(id),
    getViolationHearings(id),
    getViolationStatusHistory(id),
    getViolationLinkedFines(id)
  ]);

  const propertyLabel = violation.properties?.address ?? "Unknown property";
  const residentLabel = violation.residents
    ? `${violation.residents.first_name} ${violation.residents.last_name}`
    : "Unassigned";

  const timeline = [
    ...statusHistory.map((entry) => ({
      id: entry.id,
      title: `Status: ${formatLabel(entry.to_status)}`,
      description: entry.from_status ? `From ${formatLabel(entry.from_status)}` : undefined,
      timestamp: formatDateTime(entry.created_at),
      actor: entry.actor_name
    })),
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
                    selectOptions: violationStatusOptions()
                  }
                ]}
              />
            )
          },
          {
            id: "notices",
            label: "Notices",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Record notice"
                  submitLabel="Save notice"
                  action={createViolationNotice}
                  fields={[
                    { name: "violation_id", label: "Violation", type: "hidden", defaultValue: id },
                    {
                      name: "notice_type",
                      label: "Type",
                      type: "select",
                      defaultValue: "warning",
                      selectOptions: [
                        { value: "warning", label: "Warning" },
                        { value: "final", label: "Final notice" },
                        { value: "cure", label: "Cure notice" }
                      ]
                    },
                    {
                      name: "delivery_method",
                      label: "Delivery",
                      type: "select",
                      defaultValue: "mail",
                      selectOptions: [
                        { value: "mail", label: "Mail" },
                        { value: "email", label: "Email" },
                        { value: "posted", label: "Posted on property" }
                      ]
                    },
                    {
                      name: "delivery_status",
                      label: "Status",
                      type: "select",
                      defaultValue: "sent",
                      selectOptions: [
                        { value: "draft", label: "Draft" },
                        { value: "sent", label: "Sent" },
                        { value: "delivered", label: "Delivered" },
                        { value: "acknowledged", label: "Acknowledged" }
                      ]
                    },
                    { name: "subject", label: "Subject", required: true, defaultValue: "HOA violation notice" },
                    { name: "body", label: "Body", type: "textarea", required: true, defaultValue: violation.description }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Notice history</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No notices recorded.</p>
                    ) : (
                      notices.map((notice) => (
                        <div key={notice.id} className="rounded-md border p-3">
                          <p className="text-sm font-medium">{notice.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatLabel(notice.delivery_status)} · {formatLabel(notice.delivery_method)} · {formatDateTime(notice.created_at)}
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
            id: "hearings",
            label: "Hearings",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Schedule hearing"
                  submitLabel="Save hearing"
                  action={createViolationHearing}
                  fields={[
                    { name: "violation_id", label: "Violation", type: "hidden", defaultValue: id },
                    { name: "scheduled_at", label: "Date & time", type: "datetime-local", required: true },
                    { name: "location", label: "Location", placeholder: "Community clubhouse" },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      defaultValue: "scheduled",
                      selectOptions: [
                        { value: "scheduled", label: "Scheduled" },
                        { value: "completed", label: "Completed" },
                        { value: "continued", label: "Continued" },
                        { value: "canceled", label: "Canceled" }
                      ]
                    },
                    { name: "outcome_notes", label: "Outcome notes", type: "textarea" }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Hearing schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hearings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hearings scheduled.</p>
                    ) : (
                      hearings.map((hearing) => (
                        <div key={hearing.id} className="rounded-md border p-3">
                          <p className="text-sm font-medium">{formatDateTime(hearing.scheduled_at)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatLabel(hearing.status)} · {hearing.location ?? "Location TBD"}
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
            id: "fines",
            label: "Fines",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Linked fines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fines.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No fines linked.{" "}
                      <Link href="/dashboard/fines" className="text-primary hover:underline">
                        Create a fine
                      </Link>
                    </p>
                  ) : (
                    fines.map((fine) => (
                      <div key={fine.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{formatCents(fine.amount_cents)} · {formatLabel(fine.status)}</p>
                          <p className="text-xs text-muted-foreground">{fine.description}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/fines/${fine.id}`}>View</Link>
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
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
