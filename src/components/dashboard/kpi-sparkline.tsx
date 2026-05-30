import { cn } from "@/lib/utils";

export type SparklinePoint = {
  label?: string;
  value: number;
};

export type KpiSparklineProps = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  data: SparklinePoint[];
  className?: string;
};

const width = 120;
const height = 36;
const padding = 4;

const trendClasses = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-destructive",
  neutral: "text-muted-foreground"
};

function toSparklinePoints(data: SparklinePoint[]) {
  if (data.length === 0) return "";
  const max = Math.max(...data.map((point) => point.value), 1);
  const divisor = Math.max(data.length - 1, 1);
  return data
    .map((point, index) => {
      const x = padding + (index / divisor) * (width - padding * 2);
      const y = height - padding - (point.value / max) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function KpiSparkline({ label, value, change, trend = "neutral", data, className }: KpiSparklineProps) {
  const points = toSparklinePoints(data);
  const last = data.at(-1)?.value ?? 0;
  const first = data[0]?.value ?? 0;
  const strokeClass = last >= first ? "stroke-emerald-500" : "stroke-destructive";

  return (
    <div className={cn("rounded-md border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {change ? <p className={cn("mt-1 text-xs font-medium", trendClasses[trend])}>{change}</p> : null}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-28 shrink-0" aria-hidden="true">
          <polyline
            points={points}
            fill="none"
            className={strokeClass}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
