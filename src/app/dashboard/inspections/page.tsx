import { CalendarCheck } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getInspectionRows } from "@/lib/services/dashboard-service";
import { scheduleInspection } from "../actions";

export default async function InspectionsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getInspectionRows();
  return (
    <ModulePage
      title="Inspections"
      description="Calendar scheduling, upcoming inspections, inspector assignments, mobile-friendly custom checklists, photo capture, reports, findings, and recommendations."
      icon={CalendarCheck}
      action="Schedule inspection"
      columns={["title", "date", "assignee", "completion"]}
      rows={rows}
      panels={["Calendar view", "Mobile checklist", "Inspection report"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Schedule inspection"
          submitLabel="Schedule"
          action={scheduleInspection}
          fields={[
            { name: "title", label: "Inspection title", required: true },
            { name: "scheduled_for", label: "Scheduled for", type: "datetime-local" }
          ]}
        />
      }
    />
  );
}
