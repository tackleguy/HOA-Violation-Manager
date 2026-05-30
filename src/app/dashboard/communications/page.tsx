import { Megaphone } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getAnnouncementRows } from "@/lib/services/dashboard-service";
import { createAnnouncement, publishAnnouncement } from "../actions";

export default async function CommunicationsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getAnnouncementRows();

  return (
    <ModulePage
      title="Communications"
      description="Community notices, board updates, maintenance alerts, historical message logs, and a searchable communication archive."
      icon={Megaphone}
      action="Create announcement"
      columns={["title", "audience", "status", "sent"]}
      rows={rows}
      panels={["Announcement builder", "Message log", "Searchable archive"]}
      message={params.message}
      error={params.error}
      form={
        <div className="space-y-4">
          <RecordForm
            title="Create announcement"
            submitLabel="Save draft"
            action={createAnnouncement}
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "body", label: "Body", type: "textarea", required: true },
              {
                name: "audience",
                label: "Audience",
                type: "select",
                defaultValue: "all",
                selectOptions: [
                  { value: "all", label: "All residents" },
                  { value: "owners", label: "Owners" },
                  { value: "board", label: "Board" },
                  { value: "staff", label: "Staff" }
                ]
              }
            ]}
          />
          <RecordForm
            title="Publish announcement"
            submitLabel="Publish now"
            action={publishAnnouncement}
            fields={[
              { name: "title", label: "Title", required: true },
              { name: "body", label: "Body", type: "textarea", required: true },
              {
                name: "audience",
                label: "Audience",
                type: "select",
                defaultValue: "all",
                selectOptions: [
                  { value: "all", label: "All residents" },
                  { value: "owners", label: "Owners" },
                  { value: "board", label: "Board" },
                  { value: "staff", label: "Staff" }
                ]
              }
            ]}
          />
        </div>
      }
    />
  );
}
