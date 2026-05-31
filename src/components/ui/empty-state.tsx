import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-subtle">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? (
        <Button className="mt-5" size="sm" type="button">
          {action}
        </Button>
      ) : null}
    </div>
  );
}
