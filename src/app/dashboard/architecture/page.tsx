import { Building2 } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getArchitecturalRows } from "@/lib/services/dashboard-service";
import { createArchitecturalRequest } from "../actions";

export default async function ArchitecturePage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getArchitecturalRows();
  return (
    <ModulePage
      title="Architectural requests"
      description="Request forms, drawings, supporting documents, review workflow, approval history, reviewer comments, and decision records."
      icon={Building2}
      action="Submit request"
      columns={["title", "property", "status", "reviewer"]}
      rows={rows}
      panels={["Submission package", "Board review", "Approval history"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Submit request"
          submitLabel="Create request"
          action={createArchitecturalRequest}
          fields={[
            { name: "property_id", label: "Property UUID", required: true },
            { name: "resident_id", label: "Resident UUID" },
            { name: "title", label: "Request title", required: true },
            { name: "description", label: "Description", type: "textarea" }
          ]}
        />
      }
    />
  );
}
