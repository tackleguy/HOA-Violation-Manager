import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-card text-card-foreground",
      info: "border-primary/30 bg-primary/5 text-foreground",
      success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
      warning: "border-accent/40 bg-accent/10 text-amber-900 dark:text-amber-100",
      destructive: "border-destructive/30 bg-destructive/10 text-destructive"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: AlertCircle
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

export function Alert({ className, variant = "default", children, ...props }: AlertProps) {
  const Icon = iconMap[variant ?? "default"];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-normal", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn("text-sm text-muted-foreground [&_p]:leading-relaxed", className)} {...props} />;
}
