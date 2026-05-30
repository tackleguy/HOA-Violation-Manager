"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type BulkAction = {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  onClick: (selectedIds: string[]) => void;
};

export type BulkActionsBarProps = {
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
  entityLabel?: string;
};

export function BulkActionsBar({
  selectedIds,
  actions,
  onClearSelection,
  className,
  entityLabel = "item"
}: BulkActionsBarProps) {
  if (selectedIds.length === 0) return null;

  const label = selectedIds.length === 1 ? entityLabel : `${entityLabel}s`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm font-medium">
        {selectedIds.length} {label} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant={action.variant ?? "outline"}
            onClick={() => action.onClick(selectedIds)}
          >
            {action.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}
