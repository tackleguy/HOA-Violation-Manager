import { Activity } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";
import { getActivityRows } from "@/lib/services/dashboard-service";

export default async function ActivityPage() {
  const rows = await getActivityRows();
  return (
    <ModulePage
      title="Activity center"
      description="Complete audit system with every action logged, user tracking, timestamp tracking, and searchable history for compliance and transparency."
      icon={Activity}
      action="Export audit log"
      columns={["event", "actor", "target", "time"]}
      rows={rows}
      panels={["Audit policy", "User tracking", "Retention controls"]}
    />
  );
}
