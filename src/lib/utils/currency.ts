export type CurrencyFormatOptions = {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCents(
  cents: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  const locale = options.locale ?? "en-US";
  const currency = options.currency ?? "USD";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2
  }).format(centsToDollars(cents));
}

export function formatDollars(
  dollars: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  if (dollars == null || Number.isNaN(dollars)) return "—";
  return formatCents(dollarsToCents(dollars), options);
}

export function parseCurrencyInput(value: string): number | null {
  const normalized = value.replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const dollars = Number.parseFloat(normalized);
  if (Number.isNaN(dollars)) return null;
  return dollarsToCents(dollars);
}

export function formatCompactCents(cents: number): string {
  const dollars = centsToDollars(cents);
  if (Math.abs(dollars) >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(dollars) >= 1_000) {
    return `$${(dollars / 1_000).toFixed(1)}K`;
  }
  return formatCents(cents);
}
