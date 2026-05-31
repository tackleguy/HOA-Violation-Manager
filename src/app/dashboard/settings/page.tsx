import { Settings } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { NotificationPanel } from "@/components/dashboard/notification-panel";
import { RecordForm } from "@/components/dashboard/record-form";
import { APP_ROLES, ROLE_LABELS } from "@/lib/permissions";
import { getMemberRows } from "@/lib/services/dashboard-service";
import { getUserNotifications } from "@/lib/services/notification-service";
import { getOrganizationContext } from "@/lib/services/organization-service";
import { inviteMember, markAllNotificationsRead, markNotificationRead, updateNotificationPrefs, updateOrganization, createCategory } from "../actions";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [rows, orgContext, rawNotifications] = await Promise.all([
    getMemberRows(),
    getOrganizationContext(),
    getUserNotifications(20)
  ]);

  const organization = orgContext?.organization;
  const notificationItems = rawNotifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    read_at: notification.read_at,
    created_at: notification.created_at
  }));

  return (
    <div className="space-y-6">
      <ModulePage
        title="Settings"
        description="Organization details, branding, contact information, user invitations, role assignments, access control, and notification preferences."
        icon={Settings}
        action="Invite user"
        columns={["name", "role", "status", "access"]}
        rows={rows}
        panels={["Organization settings", "Role permissions", "Notifications"]}
        message={params.message}
        error={params.error}
        form={
          <div className="space-y-4">
            <RecordForm
              title="Organization settings"
              submitLabel="Save organization"
              action={updateOrganization}
              fields={[
                { name: "name", label: "Organization name", required: true, defaultValue: organization?.name ?? "" },
                { name: "contact_email", label: "Contact email", type: "email", defaultValue: organization?.contact_email ?? "" },
                { name: "contact_phone", label: "Contact phone", type: "tel", defaultValue: organization?.contact_phone ?? "" }
              ]}
            />
            <RecordForm
              title="Invite user"
              submitLabel="Send invitation"
              action={inviteMember}
              fields={[
                { name: "email", label: "Email", type: "email", required: true },
                {
                  name: "role",
                  label: "Role",
                  type: "select",
                  defaultValue: "read_only",
                  selectOptions: APP_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }))
                }
              ]}
            />
            <RecordForm
              title="Violation category"
              submitLabel="Add category"
              action={createCategory}
              fields={[
                { name: "name", label: "Category name", required: true, placeholder: "Landscaping" },
                {
                  name: "default_severity",
                  label: "Default severity",
                  type: "select",
                  defaultValue: "medium",
                  selectOptions: [
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" }
                  ]
                }
              ]}
            />
            <RecordForm
              title="Notification preferences"
              submitLabel="Save preferences"
              action={updateNotificationPrefs}
              fields={[
                { name: "email_violations", label: "Email: violations", type: "select", defaultValue: "true", selectOptions: booleanOptions },
                { name: "email_announcements", label: "Email: announcements", type: "select", defaultValue: "true", selectOptions: booleanOptions },
                { name: "email_inspections", label: "Email: inspections", type: "select", defaultValue: "true", selectOptions: booleanOptions }
              ]}
            />
          </div>
        }
      />
      <NotificationPanel
        notifications={notificationItems}
        markReadAction={markNotificationRead}
        markAllReadAction={markAllNotificationsRead}
      />
    </div>
  );
}

const booleanOptions = [
  { value: "true", label: "Enabled" },
  { value: "false", label: "Disabled" }
];
