import { Users } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getResidentRows } from "@/lib/services/dashboard-service";
import { createResident } from "../actions";

export default async function ResidentsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getResidentRows();
  return (
    <ModulePage
      title="Residents"
      description="Searchable resident directory with profiles, contact information, property ownership, notes, and timelines for violations, requests, inspections, and activity history."
      icon={Users}
      action="Add resident"
      columns={["name", "property", "email", "status", "violations"]}
      rows={rows}
      panels={["Resident profile", "Timeline", "Communication history"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Add resident"
          submitLabel="Create resident"
          action={createResident}
          fields={[
            { name: "first_name", label: "First name", required: true },
            { name: "last_name", label: "Last name", required: true },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "notes", label: "Notes", type: "textarea" }
          ]}
        />
      }
    />
  );
}
