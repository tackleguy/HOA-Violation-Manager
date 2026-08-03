import type { ReactNode } from "react";
import { FormStatus } from "@/components/a11y/form-status";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  message?: string;
  error?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, description, message, error, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="max-w-xl text-sm text-muted-foreground">{description}</p> : null}
        <FormStatus error={error} message={message} />
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
