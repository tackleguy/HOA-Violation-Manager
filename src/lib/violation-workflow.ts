export const VIOLATION_STATUSES = [
  "draft",
  "open",
  "under_review",
  "notice_sent",
  "warning_sent",
  "hearing_scheduled",
  "appealed",
  "fine_pending",
  "resolved",
  "closed"
] as const;

export type ViolationStatus = (typeof VIOLATION_STATUSES)[number];

export const VIOLATION_STATUS_LABELS: Record<ViolationStatus, string> = {
  draft: "Draft",
  open: "Open",
  under_review: "Under review",
  notice_sent: "Notice sent",
  warning_sent: "Warning sent",
  hearing_scheduled: "Hearing scheduled",
  appealed: "Appealed",
  fine_pending: "Fine pending",
  resolved: "Resolved",
  closed: "Closed"
};

export const ACTIVE_VIOLATION_STATUSES: ViolationStatus[] = [
  "open",
  "under_review",
  "notice_sent",
  "warning_sent",
  "hearing_scheduled",
  "appealed",
  "fine_pending"
];

export const TERMINAL_VIOLATION_STATUSES: ViolationStatus[] = ["resolved", "closed"];

export const NOTICE_DELIVERY_STATUSES = ["draft", "sent", "delivered", "failed", "acknowledged"] as const;

export const HEARING_STATUSES = ["scheduled", "completed", "continued", "canceled", "no_show"] as const;

export function isActiveViolationStatus(status: string) {
  return ACTIVE_VIOLATION_STATUSES.includes(status as ViolationStatus);
}

export function isOverdueViolation(dueDate: string | null | undefined, status: string) {
  if (!dueDate || TERMINAL_VIOLATION_STATUSES.includes(status as ViolationStatus)) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function violationStatusOptions() {
  return VIOLATION_STATUSES.map((value) => ({
    value,
    label: VIOLATION_STATUS_LABELS[value]
  }));
}
