import type { ReactNode } from "react";
import { ModuleDataExplorer, type ModuleRow } from "@/components/dashboard/module-data-explorer";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

type ModulePageProps = {
  title: string;
  description?: string;
  action: string;
  columns: string[];
  rows: ModuleRow[];
  panels?: string[];
  message?: string;
  error?: string;
  form?: ReactNode;
  icon?: unknown;
};

export function ModulePage({ title, description, action, columns, rows, message, error, form }: ModulePageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        title={title}
        description={description}
        message={message}
        error={error}
        actions={<Button size="sm">{action}</Button>}
      />

      <ModuleDataExplorer
        title={title}
        columns={columns}
        rows={rows}
        emptyTitle={`No ${title.toLowerCase()} yet`}
        emptyDescription="Create a record to get started."
        emptyAction={action}
      />

      {form ? <section className="section-stack border-t border-border/80 pt-8">{form}</section> : null}
    </div>
  );
}
