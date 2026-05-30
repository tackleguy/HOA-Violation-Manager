import * as React from "react";
import { cn } from "@/lib/utils";

export type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal" | "both";
  maxHeight?: string | number;
};

export function ScrollArea({
  className,
  children,
  orientation = "vertical",
  maxHeight,
  style,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        "relative",
        orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
        orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
        orientation === "both" && "overflow-auto",
        "[scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]",
        className
      )}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ScrollBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("hidden", className)} {...props} />;
}
