export type BarChartDatum = {
  label: string;
  value: number;
  color?: string;
};

export type BarChartProps = {
  data: BarChartDatum[];
  title?: string;
  className?: string;
  height?: number;
};

const width = 640;
const padding = 40;

export function BarChart({ data, title, className, height = 280 }: BarChartProps) {
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const barGap = 12;
  const barWidth = (width - padding * 2 - barGap * (data.length - 1)) / Math.max(data.length, 1);

  return (
    <div className={className}>
      {title ? <h3 className="mb-3 text-sm font-medium">{title}</h3> : null}
      <div className="rounded-md border bg-background p-4" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label={title ?? "Bar chart"}>
          {[0, 1, 2, 3].map((line) => {
            const y = padding + (chartHeight / 3) * line;
            return (
              <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 6" />
            );
          })}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barGap);
            const y = height - padding - barHeight;
            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={item.color ?? "hsl(var(--primary))"}
                />
                <text x={x + barWidth / 2} y={height - 12} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  {item.label}
                </text>
                <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-foreground text-[11px] font-medium">
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
