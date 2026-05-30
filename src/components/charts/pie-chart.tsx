export type PieChartDatum = {
  label: string;
  value: number;
  color?: string;
};

export type PieChartProps = {
  data: PieChartDatum[];
  title?: string;
  className?: string;
  size?: number;
};

const defaultColors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(142 71% 45%)",
  "hsl(0 72% 51%)",
  "hsl(215 16% 42%)"
];

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export function PieChart({ data, title, className, size = 240 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;

  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;
    return {
      ...item,
      path: describeArc(cx, cy, radius, startAngle, endAngle),
      color: item.color ?? defaultColors[index % defaultColors.length],
      percent: Math.round((item.value / total) * 100)
    };
  });

  return (
    <div className={className}>
      {title ? <h3 className="mb-3 text-sm font-medium">{title}</h3> : null}
      <div className="rounded-md border bg-background p-4">
        <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title ?? "Pie chart"}>
            {slices.map((slice) => (
              <path key={slice.label} d={slice.path} fill={slice.color} stroke="hsl(var(--background))" strokeWidth="2" />
            ))}
          </svg>
          <ul className="space-y-2 text-sm">
            {slices.map((slice) => (
              <li key={slice.label} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                  {slice.label}
                </span>
                <span className="text-muted-foreground">
                  {slice.value} ({slice.percent}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
