import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type StatItem = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
};

export type StatGridProps = {
  items: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
};

const trendClasses = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-destructive",
  neutral: "text-muted-foreground"
};

export function StatGrid({ items, columns = 4, className }: StatGridProps) {
  const gridClass =
    columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={cn("grid gap-4", gridClass, className)}>
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
            {item.change ? (
              <p className={cn("mt-1 text-xs font-medium", trendClasses[item.trend ?? "neutral"])}>{item.change}</p>
            ) : null}
            {item.description ? <p className="mt-2 text-xs text-muted-foreground">{item.description}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
