import type { ComplianceReport } from "@/lib/services/reports-service";

type ComplianceChartProps = {
  data: ComplianceReport;
};

const width = 640;
const height = 200;
const padding = 24;

export function ComplianceChart({ data }: ComplianceChartProps) {
  const maxValue = Math.max(1, ...data.trend.flatMap((point) => [point.opened, point.resolved]));
  const openedPoints = data.trend.map((point, index) => toPoint(index, point.opened, maxValue, data.trend.length)).join(" ");
  const resolvedPoints = data.trend.map((point, index) => toPoint(index, point.resolved, maxValue, data.trend.length)).join(" ");

  return (
    <div className="section-stack">
      <div className="flex items-center justify-between gap-4 text-sm">
        <h2 className="font-medium">Compliance trend</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Opened</span>
          <span className="text-muted-foreground/60">Resolved</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label="Compliance trend chart">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="hsl(var(--border))" />;
        })}
        <polyline points={openedPoints} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={resolvedPoints} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        {data.trend.map((point, index) => {
          const x = padding + (index / Math.max(data.trend.length - 1, 1)) * (width - padding * 2);
          return (
            <text key={point.month} x={x} y={height - 4} textAnchor="middle" className="fill-muted-foreground text-[11px]">
              {point.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function toPoint(index: number, value: number, maxValue: number, length: number) {
  const x = padding + (index / Math.max(length - 1, 1)) * (width - padding * 2);
  const y = height - padding - (value / maxValue) * (height - padding * 2);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}
