import { ShieldCheck } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { formatLabel } from "@/lib/format";
import { getViolationRows } from "@/lib/services/dashboard-service";
import { getCategories, getProperties, getResidents } from "@/lib/services/reference-data-service";
import { createViolation } from "../actions";

export default async function ViolationsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [rows, properties, residents, categories] = await Promise.all([
    getViolationRows(),
    getProperties(),
    getResidents(),
    getCategories()
  ]);

  return (
    <ModulePage
      title="Violations"
      description="Create violations with category, description, due date, severity, evidence uploads, comments, timelines, workflow states, and resolution tracking."
      icon={ShieldCheck}
      action="Create violation"
      columns={["category", "property", "severity", "status", "due"]}
      rows={rows}
      panels={["Photo evidence", "Workflow", "Resolution tracking"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Create violation"
          submitLabel="Save violation"
          action={createViolation}
          fields={[
            {
              name: "property_id",
              label: "Property",
              type: "select",
              required: true,
              selectOptions: properties.map((p) => ({ value: p.id, label: p.label }))
            },
            {
              name: "resident_id",
              label: "Resident",
              type: "select",
              selectOptions: [{ value: "", label: "None" }, ...residents.map((r) => ({ value: r.id, label: r.label }))]
            },
            {
              name: "category_id",
              label: "Category",
              type: "select",
              selectOptions: [{ value: "", label: "None" }, ...categories.map((c) => ({ value: c.id, label: c.label }))]
            },
            { name: "description", label: "Description", type: "textarea", required: true },
            {
              name: "severity",
              label: "Severity",
              type: "select",
              defaultValue: "medium",
              selectOptions: ["low", "medium", "high", "critical"].map((value) => ({ value, label: formatLabel(value) }))
            },
            { name: "due_date", label: "Due date", type: "date" }
          ]}
        />
      }
    />
  );
}
