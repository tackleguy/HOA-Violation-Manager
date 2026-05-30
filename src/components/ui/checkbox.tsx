"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 text-sm",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <span className="pointer-events-none absolute inset-0 rounded-sm border border-input bg-background transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background" />
          <Check className="pointer-events-none relative z-10 h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
        {label ? <span>{label}</span> : null}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
