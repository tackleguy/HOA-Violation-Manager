import type { TrendPoint } from "@/lib/services/dashboard-service";

const width = 640;
const height = 240;
const padding = 28;

type TrendChartProps = {
  data: TrendPoint[];
};

export function TrendChart({ data }: TrendChartProps) {
  const maxValue = Math.max(1, ...data.flatMap((point) => [point.violations, point.resolved, point.inspections]));
  const violations = data.map((point, index) => toPoint(index, point.violations, maxValue, data.length)).join(" ");
  const resolved = data.map((point, index) => toPoint(index, point.resolved, maxValue, data.length)).join(" ");
  const area = `${padding},${height - padding} ${violations} ${width - padding},${height - padding}`;

  return (
    <div className="h-72 w-full min-w-0 rounded-md border bg-background p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Monthly violation and resolution trends">
        <defs>
          <linearGradient id="trendArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.24" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 6" />;
        })}
        <polygon points={area} fill="url(#trendArea)" />
        <polyline points={violations} fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={resolved} fill="none" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((point, index) => {
          const [x, y] = toPoint(index, point.violations, maxValue, data.length).split(",").map(Number);
          return (
            <g key={point.month}>
              <circle cx={x} cy={y} r="5" fill="hsl(var(--primary))" />
              <text x={x} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[12px]">
                {point.month}
              </text>
            </g>
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
