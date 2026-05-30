import { Gavel } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { formatLabel } from "@/lib/format";
import { getMeetingRows } from "@/lib/services/meetings-service";
import { createBoardMeeting } from "../actions";

export default async function MeetingsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getMeetingRows();

  return (
    <ModulePage
      title="Board Meetings"
      description="Schedule board meetings, manage agendas, capture minutes, and track meeting status from planning through completion."
      icon={Gavel}
      action="Schedule meeting"
      columns={["title", "type", "scheduled", "location", "status"]}
      rows={rows}
      panels={["Agenda builder", "Minutes capture", "Meeting calendar"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Schedule board meeting"
          submitLabel="Schedule meeting"
          action={createBoardMeeting}
          fields={[
            { name: "title", label: "Meeting title", required: true },
            {
              name: "meeting_type",
              label: "Meeting type",
              type: "select",
              defaultValue: "regular",
              selectOptions: ["regular", "special", "emergency"].map((value) => ({ value, label: formatLabel(value) }))
            },
            { name: "scheduled_at", label: "Scheduled for", type: "datetime-local", required: true },
            { name: "location", label: "Location", placeholder: "Community clubhouse" },
            { name: "agenda_summary", label: "Agenda summary", type: "textarea" }
          ]}
        />
      }
    />
  );
}
