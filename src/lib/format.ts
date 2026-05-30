import { format, parseISO } from "date-fns";

export function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return value;
  }
}
