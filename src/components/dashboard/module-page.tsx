import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleDataExplorer, type ModuleRow } from "@/components/dashboard/module-data-explorer";
import { ModuleInsights } from "@/components/dashboard/module-insights";

type ModulePageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  columns: string[];
  rows: ModuleRow[];
  panels: string[];
  message?: string;
  error?: string;
  form?: ReactNode;
};

export function ModulePage({ title, description, icon: Icon, action, columns, rows, panels, message, error, form }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="outline" className="mb-3">
            <Icon className="mr-1 h-3.5 w-3.5" />
            HOAFlow module
          </Badge>
          <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </div>
        <Button>
          <Icon className="h-4 w-4" />
          {action}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <ModuleDataExplorer
            title={title}
            columns={columns}
            rows={rows}
            emptyTitle={`No ${title.toLowerCase()} yet`}
            emptyDescription="New tenant workspaces start clean and fill as teams import records or create workflows."
            emptyAction={action}
          />
        </div>
        <div className="space-y-4">
          {form}
          <ModuleInsights title={title} rows={rows} panels={panels} />
        </div>
      </div>
    </div>
  );
}
