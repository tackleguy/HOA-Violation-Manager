import { formatDistanceToNow } from "date-fns";
import { Wrench } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";
import { getAssigneeOptions, getVendorOptions, getWorkOrderDetail } from "@/lib/services/work-orders-service";
import { getProperties } from "@/lib/services/reference-data-service";
import { addWorkOrderComment, updateWorkOrder, updateWorkOrderStatus } from "../../actions";

const statusOptions = ["open", "assigned", "in_progress", "completed", "canceled"].map((value) => ({
  value,
  label: formatLabel(value)
}));

export default async function WorkOrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const workOrder = await getWorkOrderDetail(id);
  if (!workOrder) notFound();

  const [properties, assignees, vendors] = await Promise.all([
    getProperties(),
    getAssigneeOptions(),
    getVendorOptions()
  ]);

  const propertyLabel = workOrder.properties?.address ?? "Community-wide";
  const assigneeLabel = workOrder.assignee?.full_name ?? workOrder.vendors?.name ?? "Unassigned";

  const timeline = [
  {
      id: "opened",
      title: "Work order opened",
      description: workOrder.description ?? workOrder.title,
      timestamp: workOrder.due_date ? `Due ${formatDate(workOrder.due_date)}` : "No due date"
    },
    ...workOrder.work_order_comments.map((comment) => ({
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
        title={workOrder.title}
        subtitle={`${formatLabel(workOrder.category)} · ${propertyLabel}`}
        status={workOrder.status}
        icon={Wrench}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/work-orders">Back to list</Link>
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
                  <CardTitle>Work order details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Property</p>
                    <p className="text-sm font-medium">{propertyLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Assignee</p>
                    <p className="text-sm font-medium">{assigneeLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Priority</p>
                    <p className="text-sm font-medium">{formatLabel(workOrder.priority)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Due date</p>
                    <p className="text-sm font-medium">{formatDate(workOrder.due_date)}</p>
                  </div>
                  {workOrder.completed_at ? (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Completed</p>
                      <p className="text-sm font-medium">{formatDateTime(workOrder.completed_at)}</p>
                    </div>
                  ) : null}
                  {workOrder.description ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Description</p>
                      <p className="text-sm">{workOrder.description}</p>
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
                action={updateWorkOrderStatus}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: workOrder.status,
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
                  action={addWorkOrderComment}
                  fields={[
                    { name: "work_order_id", label: "Work order", type: "hidden", defaultValue: id },
                    { name: "body", label: "Comment", type: "textarea", required: true }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Thread</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workOrder.work_order_comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No comments yet.</p>
                    ) : (
                      workOrder.work_order_comments.map((comment) => (
                        <div key={comment.id} className="rounded-md border p-3">
                          <p className="text-sm">{comment.body}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {comment.profiles?.full_name ?? "Staff"} ·{" "}
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
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
                title="Edit work order"
                submitLabel="Save changes"
                action={updateWorkOrder}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  { name: "title", label: "Title", required: true, defaultValue: workOrder.title },
                  { name: "description", label: "Description", type: "textarea", defaultValue: workOrder.description ?? "" },
                  {
                    name: "property_id",
                    label: "Property",
                    type: "select",
                    defaultValue: workOrder.property_id ?? "",
                    selectOptions: [{ value: "", label: "Community-wide" }, ...properties.map((p) => ({ value: p.id, label: p.label }))]
                  },
                  {
                    name: "category",
                    label: "Category",
                    type: "select",
                    defaultValue: workOrder.category,
                    selectOptions: ["maintenance", "landscaping", "plumbing", "electrical", "security", "other"].map((value) => ({
                      value,
                      label: formatLabel(value)
                    }))
                  },
                  {
                    name: "priority",
                    label: "Priority",
                    type: "select",
                    defaultValue: workOrder.priority,
                    selectOptions: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: formatLabel(value) }))
                  },
                  {
                    name: "assigned_to",
                    label: "Assign to staff",
                    type: "select",
                    defaultValue: workOrder.assigned_to ?? "",
                    selectOptions: [{ value: "", label: "Unassigned" }, ...assignees.map((a) => ({ value: a.id, label: a.label }))]
                  },
                  {
                    name: "vendor_id",
                    label: "Assign vendor",
                    type: "select",
                    defaultValue: workOrder.vendor_id ?? "",
                    selectOptions: [{ value: "", label: "None" }, ...vendors.map((v) => ({ value: v.id, label: v.label }))]
                  },
                  { name: "due_date", label: "Due date", type: "date", defaultValue: workOrder.due_date ?? "" }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
