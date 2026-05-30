import { formatDateTime, formatRelativeTime } from "@/lib/utils/dates";
import { titleCase } from "@/lib/utils/strings";

export type AuditLogEntry = {
  id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  actor_name?: string | null;
};

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  insert: "Created",
  upload: "Uploaded",
  publish: "Published",
  invite: "Invited",
  resolve: "Resolved",
  close: "Closed",
  approve: "Approved",
  reject: "Rejected"
};

const TABLE_LABELS: Record<string, string> = {
  violations: "Violation",
  residents: "Resident",
  properties: "Property",
  inspections: "Inspection",
  documents: "Document",
  announcements: "Announcement",
  architectural_requests: "Architectural Request",
  memberships: "Team Member",
  violation_photos: "Violation Photo",
  document_versions: "Document Version"
};

export function formatAuditAction(action: string) {
  const normalized = action.toLowerCase();
  if (ACTION_LABELS[normalized]) return ACTION_LABELS[normalized];
  return titleCase(normalized);
}

export function formatAuditTarget(table: string | null) {
  if (!table) return "Record";
  return TABLE_LABELS[table] ?? titleCase(table.replace(/_/g, " "));
}

export function formatAuditSummary(entry: AuditLogEntry) {
  const action = formatAuditAction(entry.action);
  const target = formatAuditTarget(entry.target_table);
  const actor = entry.actor_name?.trim() || "System";
  return `${actor} ${action.toLowerCase()} ${target.toLowerCase()}`;
}

export function formatAuditTimestamp(value: string, mode: "absolute" | "relative" = "relative") {
  return mode === "absolute" ? formatDateTime(value) : formatRelativeTime(value);
}

export function getAuditIconName(action: string): "create" | "update" | "delete" | "upload" | "default" {
  const normalized = action.toLowerCase();
  if (normalized.includes("delete") || normalized === "remove") return "delete";
  if (normalized.includes("upload")) return "upload";
  if (normalized.includes("create") || normalized === "insert" || normalized === "invite") return "create";
  if (normalized.includes("update") || normalized.includes("publish") || normalized.includes("resolve")) return "update";
  return "default";
}

export function groupAuditLogsByDate(entries: AuditLogEntry[]) {
  const groups = new Map<string, AuditLogEntry[]>();
  for (const entry of entries) {
    const dateKey = entry.created_at.slice(0, 10);
    const bucket = groups.get(dateKey) ?? [];
    bucket.push(entry);
    groups.set(dateKey, bucket);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}
