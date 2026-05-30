import { BarChart3 } from "lucide-react";
import { ComplianceChart } from "@/components/reports/compliance-chart";
import { ExportButton } from "@/components/reports/export-button";
import { SummaryTable } from "@/components/reports/summary-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReportsDashboard } from "@/lib/services/reports-service";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { compliance, violations, financial, occupancy } = await getReportsDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="outline" className="mb-3">
            <BarChart3 className="mr-1 h-3.5 w-3.5" />
            HOAFlow module
          </Badge>
          <h1 className="text-3xl font-semibold tracking-normal">Reports & analytics</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Compliance trends, violation summaries, financial collections, occupancy stats, and exportable datasets for board reporting.
          </p>
          {params.message ? <p className="mt-3 text-sm text-primary">{params.message}</p> : null}
          {params.error ? <p className="mt-3 text-sm text-destructive">{params.error}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton entity="compliance_report" label="Export compliance" />
          <ExportButton entity="financial_summary" label="Export financials" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Resolution rate" value={`${compliance.resolutionRate}%`} delta={`${compliance.onTimeRate}% on time`} />
        <MetricCard label="Open violations" value={String(violations.active + violations.underReview)} delta={`${violations.overdue} overdue`} />
        <MetricCard label="Outstanding fines" value={`$${financial.outstandingFines.toLocaleString()}`} delta={`${financial.collectionRate}% collected`} />
        <MetricCard label="Occupancy" value={`${occupancy.occupancyRate}%`} delta={`${occupancy.vacant} vacant units`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <ComplianceChart data={compliance} />
        <Card>
          <CardHeader>
            <CardTitle>Violation workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Active</span><span className="font-medium">{violations.active}</span></div>
            <div className="flex justify-between"><span>Under review</span><span className="font-medium">{violations.underReview}</span></div>
            <div className="flex justify-between"><span>Warning sent</span><span className="font-medium">{violations.warningSent}</span></div>
            <div className="flex justify-between"><span>Fine pending</span><span className="font-medium">{violations.finePending}</span></div>
            <div className="flex justify-between"><span>Resolved</span><span className="font-medium">{violations.resolved}</span></div>
            <div className="flex justify-between border-t pt-3"><span>Avg resolution</span><span className="font-medium">{violations.avgResolutionDays} days</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryTable
          title="Compliance by category"
          columns={["category", "count", "resolved"]}
          rows={compliance.byCategory.map((row) => ({ category: row.category, count: row.count, resolved: row.resolved }))}
        />
        <SummaryTable
          title="Occupancy by section"
          columns={["section", "total", "occupied"]}
          rows={occupancy.bySection.map((row) => ({ section: row.section, total: row.total, occupied: row.occupied }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryTable
          title="Financial assessments"
          columns={["month", "assessed", "collected"]}
          rows={financial.monthlyAssessments.map((row) => ({
            month: row.month,
            assessed: `$${row.assessed.toLocaleString()}`,
            collected: `$${row.collected.toLocaleString()}`
          }))}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Export datasets</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ExportButton entity="residents" />
            <ExportButton entity="properties" />
            <ExportButton entity="violations" />
            <ExportButton entity="documents" />
            <ExportButton entity="inspections" />
            <ExportButton entity="occupancy_stats" label="Export occupancy" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
