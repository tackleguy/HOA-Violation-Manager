import { Building2 } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getArchitecturalRows } from "@/lib/services/dashboard-service";
import { getProperties, getResidents } from "@/lib/services/reference-data-service";
import { createArchitecturalRequest } from "../actions";

export default async function ArchitecturePage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [rows, properties, residents] = await Promise.all([getArchitecturalRows(), getProperties(), getResidents()]);

  return (
    <ModulePage
      title="Architecture"
      description="Submission forms, file uploads, approval workflows, board review, and decision history for architectural change requests."
      icon={Building2}
      action="New request"
      columns={["title", "property", "status", "reviewer"]}
      rows={rows}
      panels={["Submission queue", "Board review", "Decision history"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Submit architectural request"
          submitLabel="Create request"
          action={createArchitecturalRequest}
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
            { name: "title", label: "Project title", required: true },
            { name: "description", label: "Description", type: "textarea" }
          ]}
        />
      }
    />
  );
}
