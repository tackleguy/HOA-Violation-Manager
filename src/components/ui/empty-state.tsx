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
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-8 text-center">
      <div className="mb-4 rounded-lg bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? (
        <Button className="mt-5" size="sm">
          {action}
        </Button>
      ) : null}
    </div>
  );
}
