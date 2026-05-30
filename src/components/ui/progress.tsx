import * as React from "react";
import { cn } from "@/lib/utils";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  max?: number;
  indicatorClassName?: string;
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const clamped = Math.min(Math.max(value, 0), max);
    const percent = max === 0 ? 0 : (clamped / max) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn("h-full rounded-full bg-primary transition-all duration-300 ease-out", indicatorClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
