"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
};

export function Popover({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = "center",
  className,
  contentClassName
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      return () => document.removeEventListener("mousedown", handlePointerDown);
    }
  }, [open, setOpen]);

  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, setOpen]);

  const alignClass =
    align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <div ref={containerRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="inline-flex"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="dialog"
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-50 min-w-[12rem] rounded-md border bg-card p-3 text-card-foreground shadow-soft animate-fade-up",
            alignClass,
            contentClassName
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function PopoverHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-2 text-sm font-medium", className)} {...props} />;
}

export function PopoverDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
