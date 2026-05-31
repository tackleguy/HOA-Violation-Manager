import { cn } from "@/lib/utils";

type MetricStatProps = {
  label: string;
  value: string;
  delta?: string;
  className?: string;
};

export function MetricStat({ label, value, delta, className }: MetricStatProps) {
  return (
    <div className={cn("min-w-[8rem] space-y-1", className)}>
      <p className="text-label">{label}</p>
      <p className="data-value text-2xl">{value}</p>
      {delta ? <p className="text-xs text-muted-foreground">{delta}</p> : null}
    </div>
  );
}

/** @deprecated Use MetricStat */
export const MetricCard = MetricStat;
