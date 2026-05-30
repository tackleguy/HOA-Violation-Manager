import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, type StatusKind } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type DetailTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export type TimelineEntry = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
};

type DetailPageProps = {
  title: string;
  subtitle?: string;
  status?: string;
  statusKind?: StatusKind;
  icon?: LucideIcon;
  actions?: ReactNode;
  tabs: DetailTab[];
  timeline?: TimelineEntry[];
  sidebar?: ReactNode;
  defaultTab?: string;
  className?: string;
};

export function DetailPage({
  title,
  subtitle,
  status,
  statusKind = "violation",
  icon: Icon,
  actions,
  tabs,
  timeline = [],
  sidebar,
  defaultTab,
  className
}: DetailPageProps) {
  const initialTab = defaultTab ?? tabs[0]?.id;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {Icon ? <Icon className="h-5 w-5 text-muted-foreground" aria-hidden /> : null}
            <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
            {status ? <StatusBadge status={status} kind={statusKind} /> : null}
          </div>
          {subtitle ? <p className="max-w-2xl text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      <div className={cn("grid gap-6", sidebar ? "lg:grid-cols-[1fr_280px]" : "")}>
        <div className="space-y-6">
          <Tabs defaultValue={initialTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>

          {timeline.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Activity timeline</CardTitle>
                <CardDescription>Recent updates and actions on this record.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {timeline.map((entry, index) => (
                    <li key={entry.id} className="relative pl-6">
                      <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-primary" aria-hidden />
                      {index < timeline.length - 1 ? (
                        <span className="absolute bottom-[-1rem] left-[3px] top-4 w-px bg-border" aria-hidden />
                      ) : null}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{entry.title}</p>
                          <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                        </div>
                        {entry.description ? <p className="text-sm text-muted-foreground">{entry.description}</p> : null}
                        {entry.actor ? <p className="text-xs text-muted-foreground">By {entry.actor}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {sidebar ? (
          <aside className="space-y-4">
            {sidebar}
          </aside>
        ) : null}
      </div>

      {sidebar ? null : <Separator />}
    </div>
  );
}
