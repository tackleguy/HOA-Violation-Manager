"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-3 text-sm",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background" />
          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform peer-checked:translate-x-5" />
        </span>
        {label ? <span>{label}</span> : null}
      </label>
    );
  }
);
Switch.displayName = "Switch";
