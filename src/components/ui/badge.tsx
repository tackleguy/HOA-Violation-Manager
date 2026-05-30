import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary",
      secondary: "bg-secondary/10 text-secondary dark:text-secondary-foreground",
      warning: "bg-accent/20 text-amber-800 dark:text-amber-200",
      success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      destructive: "bg-destructive/10 text-destructive",
      outline: "border text-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
