import { FileUp, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatAuditAction,
  formatAuditSummary,
  formatAuditTarget,
  formatAuditTimestamp,
  getAuditIconName,
  type AuditLogEntry
} from "@/lib/utils/audit";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  upload: FileUp,
  default: UserPlus
};

export type ActivityTimelineProps = {
  entries: AuditLogEntry[];
  className?: string;
  maxHeight?: number | string;
};

export function ActivityTimeline({ entries, className, maxHeight = 420 }: ActivityTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className={cn("surface-muted p-6 text-sm text-muted-foreground", className)}>
        No activity recorded yet.
      </div>
    );
  }

  return (
    <ScrollArea className={cn("surface overflow-hidden", className)} maxHeight={maxHeight}>
      <ol className="relative space-y-0 p-4">
        {entries.map((entry, index) => {
          const iconName = getAuditIconName(entry.action);
          const Icon = iconMap[iconName];
          const isLast = index === entries.length - 1;

          return (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast ? <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border" aria-hidden="true" /> : null}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-subtle">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{formatAuditSummary(entry)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatAuditAction(entry.action)} {formatAuditTarget(entry.target_table).toLowerCase()}
                  {entry.target_id ? ` · ${entry.target_id.slice(0, 8)}` : ""}
                </p>
                <time className="mt-1 block text-xs tabular-nums text-muted-foreground" dateTime={entry.created_at}>
                  {formatAuditTimestamp(entry.created_at)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </ScrollArea>
  );
}
