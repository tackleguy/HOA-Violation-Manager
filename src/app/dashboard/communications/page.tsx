import { Megaphone } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { createAnnouncement } from "../actions";

const announcements = [
  { title: "Pool maintenance", audience: "All residents", status: "Scheduled", sent: "Jun 8" },
  { title: "Board meeting reminder", audience: "Board", status: "Sent", sent: "May 29" },
  { title: "Gate code update", audience: "Owners", status: "Draft", sent: "Pending" }
];

export default async function CommunicationsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <ModulePage
      title="Communications"
      description="Community notices, board updates, maintenance alerts, historical message logs, and a searchable communication archive."
      icon={Megaphone}
      action="Create announcement"
      columns={["title", "audience", "status", "sent"]}
      rows={announcements}
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
