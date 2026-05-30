import { Home } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getPropertyRows } from "@/lib/services/dashboard-service";
import { createProperty } from "../actions";

export default async function PropertiesPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getPropertyRows();
  return (
    <ModulePage
      title="Properties"
      description="Address, parcel number, ownership history, community section, status, resident assignments, property dashboards, and an interactive community map foundation."
      icon={Home}
      action="Add property"
      columns={["address", "parcel", "section", "status"]}
      rows={rows}
      panels={["Map view", "Ownership history", "Property dashboard"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Add property"
          submitLabel="Create property"
          action={createProperty}
          fields={[
            { name: "address", label: "Address", required: true },
            { name: "parcel_number", label: "Parcel number" },
            { name: "section", label: "Community section" },
            { name: "status", label: "Status", placeholder: "clear", defaultValue: "clear" }
          ]}
        />
      }
    />
  );
}
