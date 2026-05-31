import type { ReactNode } from "react";
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
  actions?: ReactNode;
  tabs: DetailTab[];
  timeline?: TimelineEntry[];
  sidebar?: ReactNode;
  defaultTab?: string;
  className?: string;
  icon?: unknown;
};

export function DetailPage({
  title,
  subtitle,
  status,
  statusKind = "violation",
  actions,
  tabs,
  timeline = [],
  sidebar,
  defaultTab,
  className
}: DetailPageProps) {
  const initialTab = defaultTab ?? tabs[0]?.id;

  return (
    <div className={cn("page-stack", className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {status ? <StatusBadge status={status} kind={statusKind} /> : null}
          </div>
          {subtitle ? <p className="max-w-xl text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      <div className={cn("grid gap-10", sidebar ? "xl:grid-cols-[minmax(0,1fr)_240px]" : "")}>
        <div className="space-y-8">
          <Tabs defaultValue={initialTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
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
            <section className="section-stack border-t border-border/80 pt-8">
              <h2 className="text-sm font-medium">Activity</h2>
              <ul className="divider-y">
                {timeline.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm text-foreground">{entry.title}</p>
                      <span className="text-xs tabular-nums text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    {entry.description ? <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p> : null}
                    {entry.actor ? <p className="mt-1 text-xs text-muted-foreground">{entry.actor}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {sidebar ? <aside className="space-y-6 border-t border-border/80 pt-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">{sidebar}</aside> : null}
      </div>
    </div>
  );
}
