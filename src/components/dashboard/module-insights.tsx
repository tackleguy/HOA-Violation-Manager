import { Activity, CalendarDays, CheckCircle2, Clock3, FileArchive, MapPinned, MessageSquareText, Route, ShieldAlert, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModuleRow } from "@/components/dashboard/module-data-explorer";

type ModuleInsightsProps = {
  title: string;
  rows: ModuleRow[];
  panels: string[];
};

export function ModuleInsights({ title, rows, panels }: ModuleInsightsProps) {
  const normalized = title.toLowerCase();

  if (normalized.includes("propert")) return <PropertyInsights rows={rows} panels={panels} />;
  if (normalized.includes("violation")) return <ViolationInsights rows={rows} panels={panels} />;
  if (normalized.includes("inspection")) return <InspectionInsights rows={rows} panels={panels} />;
  if (normalized.includes("architectural")) return <ArchitectureInsights rows={rows} panels={panels} />;
  if (normalized.includes("document")) return <DocumentInsights rows={rows} panels={panels} />;
  if (normalized.includes("communication")) return <CommunicationInsights rows={rows} panels={panels} />;
  if (normalized.includes("activity")) return <ActivityInsights rows={rows} panels={panels} />;
  if (normalized.includes("setting")) return <SettingsInsights rows={rows} panels={panels} />;

  return <DefaultInsights rows={rows} panels={panels} />;
}

function PropertyInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  const clearCount = rows.filter((row) => String(row.status ?? "").toLowerCase().includes("clear")).length;
  const activeCount = Math.max(rows.length - clearCount, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-primary" />
            Community map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border bg-[linear-gradient(135deg,hsl(var(--muted))_25%,transparent_25%),linear-gradient(225deg,hsl(var(--muted))_25%,transparent_25%),linear-gradient(45deg,hsl(var(--muted))_25%,transparent_25%),linear-gradient(315deg,hsl(var(--muted))_25%,hsl(var(--background))_25%)] bg-[length:28px_28px]">
            {rows.slice(0, 7).map((row, index) => (
              <span
                key={`${row.address}-${index}`}
                className="absolute flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm"
                style={{
                  left: `${14 + (index * 23) % 68}%`,
                  top: `${18 + (index * 31) % 62}%`
                }}
                title={String(row.address ?? "Property")}
              >
                {index + 1}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Metric label="Clear" value={clearCount} />
            <Metric label="Needs review" value={activeCount} />
          </div>
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Map view")} />
    </>
  );
}

function ViolationInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  const stages = ["Open", "Under Review", "Warning Sent", "Fine Pending", "Resolved", "Closed"];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stages.map((stage) => {
            const count = rows.filter((row) => String(row.status ?? "").toLowerCase() === stage.toLowerCase()).length;
            return (
              <div key={stage} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                <span>{stage}</span>
                <Badge variant={count ? "default" : "outline"}>{count}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Workflow")} />
    </>
  );
}

function InspectionInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Calendar view
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.slice(0, 4).map((row, index) => (
            <div key={`${row.title}-${index}`} className="grid grid-cols-[44px_1fr] gap-3 rounded-md border p-3">
              <div className="rounded-md bg-primary/10 px-2 py-1 text-center text-xs font-semibold text-primary">{String(row.date ?? "TBD")}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.assignee} · {row.completion} complete</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Calendar view")} />
    </>
  );
}

function ArchitectureInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            Review queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Submitted", "Under Review", "Board Review", "Approved", "Rejected"].map((stage) => (
            <div key={stage} className="flex items-center justify-between text-sm">
              <span>{stage}</span>
              <Badge variant="outline">{rows.filter((row) => String(row.status ?? "").toLowerCase() === stage.toLowerCase()).length}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Board review")} />
    </>
  );
}

function DocumentInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-4 w-4 text-primary" />
            Library health
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Metric label="Files" value={rows.length} />
          <Metric label="Resident access" value={rows.filter((row) => String(row.access ?? "").toLowerCase().includes("resident")).length} />
          <Metric label="Categories" value={new Set(rows.map((row) => String(row.category ?? ""))).size} />
          <Metric label="Versions" value={new Set(rows.map((row) => String(row.version ?? ""))).size} />
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Version history")} />
    </>
  );
}

function CommunicationInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-primary" />
            Message log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.slice(0, 4).map((row, index) => (
            <div key={`${row.title}-${index}`} className="rounded-md border p-3">
              <p className="text-sm font-medium">{row.title}</p>
              <p className="text-xs text-muted-foreground">{row.audience} · {row.status} · {row.sent}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Message log")} />
    </>
  );
}

function ActivityInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Audit coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Metric label="Logged events" value={rows.length} />
          <Metric label="Tracked targets" value={new Set(rows.map((row) => String(row.target ?? ""))).size} />
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Audit policy")} />
    </>
  );
}

function SettingsInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-primary" />
            Role coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Metric label="Users" value={rows.length} />
          <Metric label="Active" value={rows.filter((row) => String(row.status ?? "").toLowerCase() === "active").length} />
          <Metric label="Invited" value={rows.filter((row) => String(row.status ?? "").toLowerCase() === "invited").length} />
        </CardContent>
      </Card>
      <DefaultInsights rows={rows} panels={panels.filter((panel) => panel !== "Role permissions")} />
    </>
  );
}

function DefaultInsights({ rows, panels }: Pick<ModuleInsightsProps, "rows" | "panels">) {
  return (
    <>
      {panels.map((panel, index) => (
        <Card key={panel}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {index % 2 === 0 ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Clock3 className="h-4 w-4 text-primary" />}
              {panel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <Metric label="Records in scope" value={rows.length} />
              <p className="text-muted-foreground">Tenant-scoped data appears here as teams add records and move work through review.</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface-muted px-3 py-2">
      <p className="data-value text-lg">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
