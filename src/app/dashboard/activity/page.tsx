import { Activity } from "lucide-react";
import { ModulePage } from "@/components/dashboard/module-page";

const logs = [
  { event: "Violation updated", actor: "Avery Collins", target: "9013 Lake Vista", time: "3 minutes ago" },
  { event: "User invited", actor: "Nadia Shah", target: "Inspector", time: "21 minutes ago" },
  { event: "Document downloaded", actor: "Graham Ellis", target: "CC&Rs", time: "1 hour ago" }
];

export default function ActivityPage() {
  return (
    <ModulePage
      title="Activity center"
      description="Complete audit system with every action logged, user tracking, timestamp tracking, and searchable history for compliance and transparency."
      icon={Activity}
      action="Export audit log"
      columns={["event", "actor", "target", "time"]}
      rows={logs}
      panels={["Audit policy", "User tracking", "Retention controls"]}
    />
  );
}
