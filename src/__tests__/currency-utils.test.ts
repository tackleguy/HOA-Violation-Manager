import { describe, expect, it } from "vitest";
import {
  centsToDollars,
  dollarsToCents,
  formatCents,
  formatCompactCents,
  formatDollars,
  parseCurrencyInput
} from "@/lib/utils/currency";

describe("currency utils", () => {
  it("converts cents and dollars", () => {
    expect(centsToDollars(250)).toBe(2.5);
    expect(dollarsToCents(2.5)).toBe(250);
    expect(dollarsToCents(2.555)).toBe(256);
  });

  it("formats cents as currency", () => {
    expect(formatCents(1999)).toBe("$19.99");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(null)).toBe("—");
  });

  it("formats dollar amounts", () => {
    expect(formatDollars(45.5)).toBe("$45.50");
  });

  it("parses currency input strings", () => {
    expect(parseCurrencyInput("$1,234.50")).toBe(123450);
    expect(parseCurrencyInput("")).toBeNull();
    expect(parseCurrencyInput("abc")).toBeNull();
  });

  it("formats compact currency values", () => {
    expect(formatCompactCents(150000)).toBe("$1.5K");
    expect(formatCompactCents(250000000)).toBe("$2.5M");
    expect(formatCompactCents(750)).toBe("$7.50");
  });
});
