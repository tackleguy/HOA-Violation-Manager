import Link from "next/link";
import { MetricStat } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardData, getTrendData } from "@/lib/services/dashboard-service";

export default async function DashboardPage() {
  const [{ metrics, activityFeed }, trendData] = await Promise.all([getDashboardData(), getTrendData()]);

  return (
    <div className="page-stack">
      <PageHeader title="Dashboard" />

      <section className="section-stack">
        <div className="flex flex-wrap gap-x-10 gap-y-8">
          {metrics.map((metric) => (
            <MetricStat key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />
          ))}
        </div>
      </section>

      <section className="section-stack">
        <h2 className="text-sm font-medium text-foreground">Trends</h2>
        <TrendChart data={trendData} />
      </section>

      <section className="section-stack">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
          <Link href="/dashboard/activity" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        </div>
        <ul className="divider-y">
          {activityFeed.map((item) => (
            <li key={item.title} className="py-3">
              <p className="text-sm text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
