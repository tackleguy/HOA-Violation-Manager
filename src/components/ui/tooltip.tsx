import * as React from "react";
import { cn } from "@/lib/utils";

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
};

const sideClasses: Record<NonNullable<TooltipProps["side"]>, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2"
};

export function Tooltip({ content, children, side = "top", className, contentClassName }: TooltipProps) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-xs rounded-md border bg-card px-2.5 py-1.5 text-xs text-card-foreground opacity-0 shadow-soft transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          sideClasses[side],
          contentClassName
        )}
      >
        {content}
      </span>
    </span>
  );
}
