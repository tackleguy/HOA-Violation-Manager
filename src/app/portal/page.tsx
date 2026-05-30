import { FileText, MessageSquare, ShieldAlert } from "lucide-react";
import { PortalCard } from "@/components/portal/portal-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import {
  getArchitecturalRows,
  getDocumentRows,
  getViolationRows
} from "@/lib/services/dashboard-service";
import { getUpcomingEvents } from "@/lib/services/calendar-service";

export default async function PortalPage() {
  const [violations, documents, requests, upcoming] = await Promise.all([
    getViolationRows(),
    getDocumentRows(),
    getArchitecturalRows(),
    getUpcomingEvents(5)
  ]);

  const openViolations = violations.filter((row) => !["Resolved", "Closed"].includes(String(row.status))).length;
  const residentDocuments = documents.filter((row) => String(row.access).toLowerCase().includes("resident")).length;
  const pendingRequests = requests.filter((row) => !["Approved", "Rejected"].includes(String(row.status))).length;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="success">Read-only resident view</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Welcome to your community portal</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          View your violations, community documents, and architectural requests. This portal is focused on read-only access for residents and viewers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PortalCard
          title="Open violations"
          description="Active compliance items linked to your community."
          value={openViolations}
          icon={ShieldAlert}
          footer="View details in Violations"
        />
        <PortalCard
          title="Community documents"
          description="Published CC&Rs, rules, and resident-access files."
          value={residentDocuments}
          icon={FileText}
          footer="Browse shared documents"
        />
        <PortalCard
          title="Pending requests"
          description="Architectural and modification requests awaiting review."
          value={pendingRequests}
          icon={MessageSquare}
          footer="Track request status"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming community events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events scheduled.</p>
          ) : (
            upcoming.map((event) => (
              <div key={event.id} className="rounded-md border bg-background p-3">
                <div className="text-sm font-medium">{event.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(event.date)} · {event.meta}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
