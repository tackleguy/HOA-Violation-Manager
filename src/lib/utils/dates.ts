import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay
} from "date-fns";

export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  try {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function formatShortDate(value: string | Date | null | undefined, fallback = "—") {
  const date = parseDate(value);
  if (!date) return fallback;
  return format(date, "MMM d, yyyy");
}

export function formatLongDate(value: string | Date | null | undefined, fallback = "—") {
  const date = parseDate(value);
  if (!date) return fallback;
  return format(date, "EEEE, MMMM d, yyyy");
}

export function formatDateTime(value: string | Date | null | undefined, fallback = "—") {
  const date = parseDate(value);
  if (!date) return fallback;
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(value: string | Date | null | undefined, fallback = "—") {
  const date = parseDate(value);
  if (!date) return fallback;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  const date = parseDate(value);
  if (!date) return null;
  return differenceInCalendarDays(startOfDay(date), startOfDay(new Date()));
}

export function isOverdue(value: string | Date | null | undefined): boolean {
  const date = parseDate(value);
  if (!date) return false;
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

export function isUpcoming(value: string | Date | null | undefined, withinDays = 7): boolean {
  const date = parseDate(value);
  if (!date) return false;
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  if (isBefore(target, today)) return false;
  const deadline = addDays(today, withinDays);
  return !isAfter(target, deadline);
}

export function toInputDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

export function toInputDateTime(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return "";
  return format(date, "yyyy-MM-dd'T'HH:mm");
}
