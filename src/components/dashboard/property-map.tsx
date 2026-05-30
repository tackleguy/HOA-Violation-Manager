"use client";

import { cn } from "@/lib/utils";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  status?: "default" | "warning" | "critical";
};

export type PropertyMapProps = {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  height?: number;
};

const statusColors = {
  default: "fill-primary",
  warning: "fill-accent",
  critical: "fill-destructive"
};

function projectMarker(marker: MapMarker, center: { lat: number; lng: number }, zoom: number, width: number, height: number) {
  const scale = Math.pow(2, zoom - 12);
  const x = width / 2 + (marker.lng - center.lng) * 8000 * scale;
  const y = height / 2 - (marker.lat - center.lat) * 8000 * scale;
  return { x, y };
}

export function PropertyMap({ markers, center, zoom = 14, className, height = 320 }: PropertyMapProps) {
  const width = 640;
  const viewHeight = height;
  const mapCenter = center ?? {
    lat: markers.reduce((sum, marker) => sum + marker.lat, 0) / Math.max(markers.length, 1) || 33.749,
    lng: markers.reduce((sum, marker) => sum + marker.lng, 0) / Math.max(markers.length, 1) || -84.388
  };

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background", className)} style={{ height }}>
      <svg viewBox={`0 0 ${width} ${viewHeight}`} className="h-full w-full" role="img" aria-label="Property map">
        <defs>
          <pattern id="mapGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={viewHeight} fill="url(#mapGrid)" />
        <rect x="24" y="24" width={width - 48} height={viewHeight - 48} rx="12" fill="hsl(var(--muted))" opacity="0.35" />
        <path
          d={`M 80 ${viewHeight - 60} L 180 ${viewHeight - 120} L 280 ${viewHeight - 80} L 420 ${viewHeight - 140} L ${width - 80} ${viewHeight - 90}`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.35"
        />
        {markers.map((marker) => {
          const { x, y } = projectMarker(marker, mapCenter, zoom, width, viewHeight);
          const color = statusColors[marker.status ?? "default"];
          return (
            <g key={marker.id} transform={`translate(${x}, ${y})`}>
              <circle r="16" className="fill-background stroke-border" strokeWidth="2" />
              <circle r="6" className={color} />
              {marker.label ? (
                <text y="28" textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  {marker.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
