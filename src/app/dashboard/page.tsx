import Link from "next/link";
import { Activity, Archive, CalendarPlus, ShieldPlus, UserPlus } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, getTrendData } from "@/lib/services/dashboard-service";

const quickLinks = [
  { name: "Create violation", href: "/dashboard/violations", icon: ShieldPlus },
  { name: "Schedule inspection", href: "/dashboard/inspections", icon: CalendarPlus },
  { name: "Upload document", href: "/dashboard/documents", icon: Archive },
  { name: "Add resident", href: "/dashboard/residents", icon: UserPlus }
];

export default async function DashboardPage() {
  const [{ metrics, activityFeed }, trendData] = await Promise.all([getDashboardData(), getTrendData()]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Open violations, hearings, fines, inspections, and recent activity across your community."
        actions={
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((action, index) => (
              <Button key={action.name} variant={index === 0 ? "default" : "outline"} size="sm" asChild>
                <Link href={action.href}>
                  <action.icon className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{action.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityFeed.map((item) => (
              <div key={item.title} className="surface-muted px-3 py-2.5">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
