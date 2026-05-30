import { Settings } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { getMemberRows } from "@/lib/services/dashboard-service";
import { inviteMember } from "../actions";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const rows = await getMemberRows();
  return (
    <ModulePage
      title="Settings"
      description="Organization details, branding, contact information, user invitations, role assignments, access control, notification settings, reminders, and escalation settings."
      icon={Settings}
      action="Invite user"
      columns={["name", "role", "status", "access"]}
      rows={rows}
      panels={["Organization settings", "Role permissions", "Notifications"]}
      message={params.message}
      error={params.error}
      form={
        <RecordForm
          title="Invite user"
          submitLabel="Send invitation"
          action={inviteMember}
          fields={[
            { name: "email", label: "Email", type: "email", required: true },
            { name: "role", label: "Role", placeholder: "read_only", defaultValue: "read_only" }
          ]}
        />
      }
    />
  );
}
