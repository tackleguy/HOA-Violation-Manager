import type { ComplianceReport } from "@/lib/services/reports-service";

type ComplianceChartProps = {
  data: ComplianceReport;
};

const width = 640;
const height = 220;
const padding = 32;

export function ComplianceChart({ data }: ComplianceChartProps) {
  const maxValue = Math.max(1, ...data.trend.flatMap((point) => [point.opened, point.resolved]));
  const openedPoints = data.trend.map((point, index) => toPoint(index, point.opened, maxValue, data.trend.length)).join(" ");
  const resolvedPoints = data.trend.map((point, index) => toPoint(index, point.resolved, maxValue, data.trend.length)).join(" ");

  return (
    <div className="rounded-md border bg-background p-4">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="font-medium">Compliance trend</div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Opened
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Resolved
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Compliance trend chart">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 6" />;
        })}
        <polyline points={openedPoints} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={resolvedPoints} fill="none" stroke="hsl(142 71% 45%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.trend.map((point, index) => {
          const [x] = toPoint(index, point.opened, maxValue, data.trend.length).split(",").map(Number);
          return (
            <text key={point.month} x={x} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[12px]">
              {point.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function toPoint(index: number, value: number, maxValue: number, length: number) {
  const divisor = Math.max(length - 1, 1);
  const x = padding + (index / divisor) * (width - padding * 2);
  const y = height - padding - (value / maxValue) * (height - padding * 2);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}
