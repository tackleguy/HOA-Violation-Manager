import { ShieldCheck } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getViolationRows } from "@/lib/services/dashboard-service";
import { createViolation, uploadViolationPhoto } from "../actions";

export default async function ViolationsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getViolationRows();
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
        <>
          <RecordForm
            title="Create violation"
            submitLabel="Save violation"
            action={createViolation}
            fields={[
              { name: "property_id", label: "Property UUID", required: true },
              { name: "resident_id", label: "Resident UUID" },
              { name: "category_id", label: "Category UUID" },
              { name: "description", label: "Description", type: "textarea", required: true },
              { name: "severity", label: "Severity", placeholder: "medium", defaultValue: "medium" },
              { name: "due_date", label: "Due date", type: "date" }
            ]}
          />
          <RecordForm
            title="Upload evidence"
            submitLabel="Upload photo"
            action={uploadViolationPhoto}
            fields={[
              { name: "violation_id", label: "Violation UUID", required: true },
              { name: "caption", label: "Caption" },
              { name: "file", label: "Photo file", type: "file", required: true }
            ]}
          />
        </>
      }
    />
  );
}
