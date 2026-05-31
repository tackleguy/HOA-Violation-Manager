import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ModuleDataExplorer, type ModuleRow } from "@/components/dashboard/module-data-explorer";
import { ModuleInsights } from "@/components/dashboard/module-insights";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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
    <div className="page-stack">
      <PageHeader
        eyebrow="Operations"
        title={title}
        description={description}
        message={message}
        error={error}
        actions={
          <Button>
            <Icon className="h-4 w-4" aria-hidden />
            {action}
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <ModuleDataExplorer
          title={title}
          columns={columns}
          rows={rows}
          emptyTitle={`No ${title.toLowerCase()} yet`}
          emptyDescription="Records appear here as your team creates violations, imports data, or completes workflows."
          emptyAction={action}
        />
        <div className="space-y-4">
          {form}
          <ModuleInsights title={title} rows={rows} panels={panels} />
        </div>
      </div>
    </div>
  );
}
