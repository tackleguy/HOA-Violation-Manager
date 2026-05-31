import type { TrendPoint } from "@/lib/services/dashboard-service";

const width = 640;
const height = 200;
const padding = 24;

type TrendChartProps = {
  data: TrendPoint[];
};

export function TrendChart({ data }: TrendChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((point) => [point.violations, point.resolved, point.inspections]));
  const violations = data.map((point, index) => toPoint(index, point.violations, maxValue, data.length)).join(" ");
  const resolved = data.map((point, index) => toPoint(index, point.resolved, maxValue, data.length)).join(" ");

  return (
    <div className="w-full min-w-0">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label="Monthly violation and resolution trends">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="hsl(var(--border))" />;
        })}
        <polyline points={violations} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={resolved} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        {data.map((point, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
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

function toPoint(index: number, value: number, maxValue: number, count: number) {
  const x = padding + (index / Math.max(count - 1, 1)) * (width - padding * 2);
  const y = height - padding - (value / maxValue) * (height - padding * 2);
  return `${x},${y}`;
}
