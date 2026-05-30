import { Wrench } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { formatLabel } from "@/lib/format";
import { getAssigneeOptions, getVendorOptions, getWorkOrderRows } from "@/lib/services/work-orders-service";
import { getProperties } from "@/lib/services/reference-data-service";
import { createWorkOrder } from "../actions";

export default async function WorkOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [rows, properties, assignees, vendors] = await Promise.all([
    getWorkOrderRows(),
    getProperties(),
    getAssigneeOptions(),
    getVendorOptions()
  ]);

  return (
    <ModulePage
      title="Work Orders"
      description="Create and assign maintenance work orders, track vendor assignments, manage priorities, and capture progress comments."
      icon={Wrench}
      action="Create work order"
      columns={["title", "category", "priority", "status", "due", "assignee"]}
      rows={rows}
      panels={["Vendor assignment", "Priority tracking", "Comment thread"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Create work order"
          submitLabel="Create work order"
          action={createWorkOrder}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "property_id",
              label: "Property",
              type: "select",
              selectOptions: [{ value: "", label: "Community-wide" }, ...properties.map((p) => ({ value: p.id, label: p.label }))]
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              defaultValue: "maintenance",
              selectOptions: ["maintenance", "landscaping", "plumbing", "electrical", "security", "other"].map((value) => ({
                value,
                label: formatLabel(value)
              }))
            },
            {
              name: "priority",
              label: "Priority",
              type: "select",
              defaultValue: "medium",
              selectOptions: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: formatLabel(value) }))
            },
            {
              name: "assigned_to",
              label: "Assign to staff",
              type: "select",
              selectOptions: [{ value: "", label: "Unassigned" }, ...assignees.map((a) => ({ value: a.id, label: a.label }))]
            },
            {
              name: "vendor_id",
              label: "Assign vendor",
              type: "select",
              selectOptions: [{ value: "", label: "None" }, ...vendors.map((v) => ({ value: v.id, label: v.label }))]
            },
            { name: "due_date", label: "Due date", type: "date" }
          ]}
        />
      }
    />
  );
}
