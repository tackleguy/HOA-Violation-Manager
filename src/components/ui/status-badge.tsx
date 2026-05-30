import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ViolationStatus = "open" | "under_review" | "warning_sent" | "fine_pending" | "resolved" | "closed";
type RequestStatus = "submitted" | "under_review" | "board_review" | "approved" | "rejected";

export type StatusKind = "violation" | "request";

type StatusBadgeProps = {
  status: string;
  kind?: StatusKind;
  className?: string;
};

const violationVariants: Record<ViolationStatus, BadgeProps["variant"]> = {
  open: "warning",
  under_review: "default",
  warning_sent: "warning",
  fine_pending: "destructive",
  resolved: "success",
  closed: "secondary"
};

const requestVariants: Record<RequestStatus, BadgeProps["variant"]> = {
  submitted: "secondary",
  under_review: "default",
  board_review: "warning",
  approved: "success",
  rejected: "destructive"
};

const violationLabels: Record<ViolationStatus, string> = {
  open: "Open",
  under_review: "Under review",
  warning_sent: "Warning sent",
  fine_pending: "Fine pending",
  resolved: "Resolved",
  closed: "Closed"
};

const requestLabels: Record<RequestStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  board_review: "Board review",
  approved: "Approved",
  rejected: "Rejected"
};

function normalizeStatus(status: string) {
  return status.trim().toLowerCase().replace(/\s+/g, "_");
}

function formatFallbackLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StatusBadge({ status, kind = "violation", className }: StatusBadgeProps) {
  const normalized = normalizeStatus(status) as ViolationStatus & RequestStatus;
  const variant =
    kind === "request"
      ? (requestVariants[normalized as RequestStatus] ?? "outline")
      : (violationVariants[normalized as ViolationStatus] ?? "outline");
  const label =
    kind === "request"
      ? (requestLabels[normalized as RequestStatus] ?? formatFallbackLabel(status))
      : (violationLabels[normalized as ViolationStatus] ?? formatFallbackLabel(status));

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
