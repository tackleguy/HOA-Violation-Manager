import { Settings } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { roles } from "@/lib/constants";
import { inviteMember } from "../actions";

const users = roles.map((role, index) => ({
  name: ["Avery Collins", "Nadia Shah", "Graham Ellis", "Sam Rivera", "Jordan Lee", "Read Only Auditor"][index],
  role,
  status: index < 5 ? "Active" : "Invited",
  access: index === 0 ? "Global" : "Evergreen Ridge"
}));

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <ModulePage
      title="Settings"
      description="Organization details, branding, contact information, user invitations, role assignments, access control, notification settings, reminders, and escalation settings."
      icon={Settings}
      action="Invite user"
      columns={["name", "role", "status", "access"]}
      rows={users}
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
