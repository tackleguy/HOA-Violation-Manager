import { Truck } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { formatLabel } from "@/lib/format";
import { getVendorRows } from "@/lib/services/vendors-service";
import { createVendor } from "../actions";

export default async function VendorsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getVendorRows();

  return (
    <ModulePage
      title="Vendors"
      description="Manage approved vendors and contractors, track contact details, categories, and active status for work order assignments."
      icon={Truck}
      action="Add vendor"
      columns={["name", "category", "email", "phone", "status"]}
      rows={rows}
      panels={["Contact directory", "Category filtering", "Work order linkage"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Add vendor"
          submitLabel="Save vendor"
          action={createVendor}
          fields={[
            { name: "name", label: "Vendor name", required: true },
            { name: "category", label: "Category", placeholder: "Landscaping" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "notes", label: "Notes", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "select",
              defaultValue: "active",
              selectOptions: ["active", "inactive"].map((value) => ({ value, label: formatLabel(value) }))
            }
          ]}
        />
      }
    />
  );
}
