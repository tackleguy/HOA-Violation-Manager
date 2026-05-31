import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
  className?: string;
};

export function MetricCard({ label, value, delta, className }: MetricCardProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-card", className)}>
      <CardContent className="space-y-3 pt-1">
        <p className="text-label">{label}</p>
        <p className="data-value text-3xl">{value}</p>
        <p className="text-xs text-muted-foreground">{delta}</p>
      </CardContent>
    </Card>
  );
}
