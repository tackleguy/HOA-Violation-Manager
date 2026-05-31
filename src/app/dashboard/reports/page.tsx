import { ComplianceChart } from "@/components/reports/compliance-chart";
import { ExportButton } from "@/components/reports/export-button";
import { SummaryTable } from "@/components/reports/summary-table";
import { MetricStat } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { getReportsDashboard } from "@/lib/services/reports-service";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { compliance, violations, financial, occupancy } = await getReportsDashboard();

  return (
    <div className="page-stack">
      <PageHeader
        title="Reports"
        description="Compliance trends, violation summaries, financial collections, and occupancy."
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportButton entity="compliance_report" label="Export compliance" />
            <ExportButton entity="financial_summary" label="Export financials" />
          </div>
        }
      />
      {params.message ? <p className="text-sm text-foreground">{params.message}</p> : null}
      {params.error ? <p className="text-sm text-destructive">{params.error}</p> : null}

      <section className="flex flex-wrap gap-x-10 gap-y-8">
        <MetricStat label="Resolution rate" value={`${compliance.resolutionRate}%`} delta={`${compliance.onTimeRate}% on time`} />
        <MetricStat label="Open violations" value={String(violations.active + violations.underReview)} delta={`${violations.overdue} overdue`} />
        <MetricStat label="Outstanding fines" value={`$${financial.outstandingFines.toLocaleString()}`} delta={`${financial.collectionRate}% collected`} />
        <MetricStat label="Occupancy" value={`${occupancy.occupancyRate}%`} delta={`${occupancy.vacant} vacant units`} />
      </section>

      <section className="section-stack xl:grid xl:grid-cols-[1.5fr_1fr] xl:gap-12">
        <ComplianceChart data={compliance} />
        <div className="section-stack">
          <h2 className="text-sm font-medium">Violation workflow</h2>
          <dl className="divider-y text-sm">
            {[
              ["Active", violations.active],
              ["Under review", violations.underReview],
              ["Warning sent", violations.warningSent],
              ["Fine pending", violations.finePending],
              ["Resolved", violations.resolved],
              ["Avg resolution", `${violations.avgResolutionDays} days`]
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-2">
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
      </section>

      <section className="grid gap-12 lg:grid-cols-2">
        <SummaryTable
          title="Financial assessments"
          columns={["month", "assessed", "collected"]}
          rows={financial.monthlyAssessments.map((row) => ({
            month: row.month,
            assessed: `$${row.assessed.toLocaleString()}`,
            collected: `$${row.collected.toLocaleString()}`
          }))}
        />
        <div className="section-stack">
          <h2 className="text-sm font-medium">Export datasets</h2>
          <div className="flex flex-wrap gap-2">
            <ExportButton entity="residents" />
            <ExportButton entity="properties" />
            <ExportButton entity="violations" />
            <ExportButton entity="documents" />
            <ExportButton entity="inspections" />
            <ExportButton entity="occupancy_stats" label="Export occupancy" />
          </div>
        </div>
      </section>
    </div>
  );
}
