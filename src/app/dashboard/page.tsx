import { Activity, Archive, CalendarPlus, ShieldPlus, UserPlus } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickActions } from "@/lib/constants";
import { getDashboardData } from "@/lib/services/dashboard-service";

export default async function DashboardPage() {
  const { metrics, activityFeed } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="success">Realtime workspace</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Dashboard overview</h1>
          <p className="mt-2 text-muted-foreground">A command center for properties, residents, violations, requests, inspections, and board operations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[ShieldPlus, CalendarPlus, Archive, UserPlus].map((Icon, index) => (
            <Button key={index} variant={index === 0 ? "default" : "outline"} size="icon" aria-label={quickActions[index].name}>
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Activity feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.map((item) => (
              <div key={item.title} className="rounded-md border bg-background p-3">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
