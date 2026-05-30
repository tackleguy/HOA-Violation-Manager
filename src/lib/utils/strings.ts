export function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(value: string, maxLength: number, suffix = "…") {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd()}${suffix}`;
}

export function initials(value: string, max = 2) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function pluralize(count: number, singular: string, plural?: string) {
  if (count === 1) return singular;
  return plural ?? `${singular}s`;
}

export function formatList(items: string[], conjunction = "and") {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${conjunction} ${items[items.length - 1]}`;
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}
