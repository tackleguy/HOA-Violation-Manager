import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "border border-foreground/20 bg-muted text-foreground",
  secondary: "border border-border bg-muted text-foreground",
  warning: "border border-amber-700/40 bg-amber-50 text-amber-950 dark:border-amber-300/40 dark:bg-amber-950/40 dark:text-amber-100",
  success: "border border-emerald-700/40 bg-emerald-50 text-emerald-950 dark:border-emerald-300/40 dark:bg-emerald-950/40 dark:text-emerald-100",
  destructive: "border border-destructive/40 bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground"
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
