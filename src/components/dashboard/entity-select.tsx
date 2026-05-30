import * as React from "react";
import { cn } from "@/lib/utils";

export type EntitySelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type EntitySelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: EntitySelectOption[];
  placeholder?: string;
};

export const EntitySelect = React.forwardRef<HTMLSelectElement, EntitySelectProps>(
  ({ className, options, placeholder, defaultValue, value, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "focus-ring flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      defaultValue={defaultValue}
      value={value}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled={props.required}>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
);
EntitySelect.displayName = "EntitySelect";
