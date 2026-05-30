import { Megaphone } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getAnnouncementRows } from "@/lib/services/dashboard-service";
import { createAnnouncement } from "../actions";

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
        <RecordForm
          title="Create announcement"
          submitLabel="Save announcement"
          action={createAnnouncement}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "body", label: "Body", type: "textarea", required: true },
            { name: "audience", label: "Audience", placeholder: "all", defaultValue: "all" }
          ]}
        />
      }
    />
  );
}
