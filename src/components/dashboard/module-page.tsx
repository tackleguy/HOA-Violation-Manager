import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ModuleTable } from "@/components/dashboard/module-table";

type ModulePageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  columns: string[];
  rows: Array<Record<string, string | number>>;
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
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search, filter, sort, and paginate records" />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </CardContent>
          </Card>
          {rows.length ? <ModuleTable title={`${title} records`} columns={columns} rows={rows} /> : <EmptyState icon={Icon} title={`No ${title.toLowerCase()} yet`} description="New tenant workspaces start clean and fill as teams import records or create workflows." action={action} />}
        </div>
        <div className="space-y-4">
          {form}
          {panels.map((panel) => (
            <Card key={panel}>
              <CardHeader>
                <CardTitle>{panel}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-2 rounded bg-primary/60" />
                  <div className="h-2 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
