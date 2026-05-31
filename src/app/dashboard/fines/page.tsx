import { CircleDollarSign } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getFineRows, getViolationOptions } from "@/lib/services/fines-service";
import { getProperties, getResidents } from "@/lib/services/reference-data-service";
import { createFine } from "../actions";

export default async function FinesPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [rows, properties, residents, violations] = await Promise.all([
    getFineRows(),
    getProperties(),
    getResidents(),
    getViolationOptions()
  ]);

  return (
    <ModulePage
      title="Fines"
      description="Issue fines linked to violations and properties, track payment status, record partial payments, and manage overdue balances."
      icon={CircleDollarSign}
      action="Issue fine"
      columns={["property", "amount", "status", "due", "resident"]}
      rows={rows}
      panels={["Payment tracking", "Violation linkage", "Status workflow"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Issue fine"
          submitLabel="Issue fine"
          action={createFine}
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
              name: "violation_id",
              label: "Linked violation",
              type: "select",
              selectOptions: [{ value: "", label: "None" }, ...violations.map((v) => ({ value: v.id, label: v.label }))]
            },
            { name: "amount", label: "Amount (USD)", type: "text", required: true, placeholder: "150.00" },
            { name: "description", label: "Description", type: "textarea", required: true },
            { name: "due_date", label: "Due date", type: "date" }
          ]}
        />
      }
    />
  );
}
