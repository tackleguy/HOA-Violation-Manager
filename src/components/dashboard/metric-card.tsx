import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  delta: string;
};

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-semibold">{value}</div>
        <div className="mt-2 text-xs text-primary">{delta}</div>
      </CardContent>
    </Card>
  );
}
