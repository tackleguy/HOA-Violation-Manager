export type AreaChartSeries = {
  id: string;
  label: string;
  color?: string;
  values: number[];
};

export type AreaChartProps = {
  labels: string[];
  series: AreaChartSeries[];
  title?: string;
  className?: string;
  height?: number;
};

const width = 640;
const padding = 36;

function toPoints(values: number[], maxValue: number, chartHeight: number, length: number) {
  const divisor = Math.max(length - 1, 1);
  return values.map((value, index) => {
    const x = padding + (index / divisor) * (width - padding * 2);
    const y = padding + chartHeight - (value / maxValue) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
}

export function AreaChart({ labels, series, title, className, height = 280 }: AreaChartProps) {
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));
  const length = labels.length;

  return (
    <div className={className}>
      {title ? <h3 className="mb-3 text-sm font-medium">{title}</h3> : null}
      <div className="rounded-md border bg-background p-4" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label={title ?? "Area chart"}>
          <defs>
            {series.map((item) => (
              <linearGradient key={item.id} id={`area-${item.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={item.color ?? "hsl(var(--primary))"} stopOpacity="0.28" />
                <stop offset="100%" stopColor={item.color ?? "hsl(var(--primary))"} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {[0, 1, 2, 3].map((line) => {
            const y = padding + (chartHeight / 3) * line;
            return (
              <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 6" />
            );
          })}
          {series.map((item) => {
            const points = toPoints(item.values, maxValue, chartHeight, length);
            const area = `${padding},${padding + chartHeight} ${points.join(" ")} ${width - padding},${padding + chartHeight}`;
            return (
              <g key={item.id}>
                <polygon points={area} fill={`url(#area-${item.id})`} />
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke={item.color ?? "hsl(var(--primary))"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
          {labels.map((label, index) => {
            const divisor = Math.max(length - 1, 1);
            const x = padding + (index / divisor) * (width - padding * 2);
            return (
              <text key={label} x={x} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {label}
              </text>
            );
          })}
        </svg>
        <ul className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {series.map((item) => (
            <li key={item.id} className="inline-flex items-center gap-2">
              <span className="h-2 w-4 rounded-full" style={{ backgroundColor: item.color ?? "hsl(var(--primary))" }} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
