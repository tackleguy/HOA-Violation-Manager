import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";
import { formatAuditSummary, formatAuditTarget } from "@/lib/utils/audit";
import {
  daysUntil,
  formatRelativeTime,
  formatShortDate,
  isOverdue,
  toInputDate
} from "@/lib/utils/dates";
import { initials, pluralize, slugify, titleCase, truncate } from "@/lib/utils/strings";
import { formatNumber, formatPercent } from "@/lib/utils";

describe("format utils", () => {
  it("formats labels and numbers", () => {
    expect(formatLabel("under_review")).toBe("Under Review");
    expect(formatNumber(1284)).toBe("1,284");
    expect(formatPercent(0.42)).toBe("42%");
  });

  it("formats ISO dates safely", () => {
    expect(formatDate("2026-05-30")).toBe("May 30, 2026");
    expect(formatDate(null)).toBe("—");
    expect(formatDateTime("2026-05-30T14:30:00.000Z")).toMatch(/May 30, 2026/);
  });

  it("formats relative and input dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    expect(formatShortDate(future.toISOString())).toMatch(/\w{3} \d{1,2}, \d{4}/);
    expect(toInputDate("2026-05-30")).toBe("2026-05-30");
    expect(daysUntil("2020-01-01")).toBeLessThan(0);
    expect(isOverdue("2020-01-01")).toBe(true);
    expect(formatRelativeTime("2026-05-30T12:00:00.000Z")).toMatch(/ago|in/);
  });

  it("formats strings", () => {
    expect(titleCase("community_manager")).toBe("Community Manager");
    expect(slugify("Getting Started Guide")).toBe("getting-started-guide");
    expect(truncate("Long community name here", 12)).toBe("Long commun…");
    expect(initials("Alex Rivera")).toBe("AR");
    expect(pluralize(1, "violation")).toBe("violation");
    expect(pluralize(3, "violation")).toBe("violations");
  });

  it("formats audit summaries", () => {
    expect(formatAuditTarget("violations")).toBe("Violation");
    expect(
      formatAuditSummary({
        id: "1",
        action: "create",
        target_table: "violations",
        target_id: "abc",
        created_at: "2026-05-30T12:00:00.000Z",
        actor_name: "Alex"
      })
    ).toBe("Alex created violation");
  });
});
