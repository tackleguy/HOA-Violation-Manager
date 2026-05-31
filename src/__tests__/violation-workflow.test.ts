import { describe, expect, it } from "vitest";
import {
  ACTIVE_VIOLATION_STATUSES,
  isActiveViolationStatus,
  isOverdueViolation,
  violationStatusOptions
} from "@/lib/violation-workflow";

describe("violation workflow helpers", () => {
  it("lists all workflow statuses", () => {
    expect(violationStatusOptions().length).toBeGreaterThanOrEqual(7);
    expect(violationStatusOptions().some((o) => o.value === "hearing_scheduled")).toBe(true);
  });

  it("identifies active statuses", () => {
    expect(isActiveViolationStatus("open")).toBe(true);
    expect(isActiveViolationStatus("resolved")).toBe(false);
    expect(ACTIVE_VIOLATION_STATUSES).toContain("appealed");
  });

  it("detects overdue violations", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isOverdueViolation(yesterday.toISOString().slice(0, 10), "open")).toBe(true);
    expect(isOverdueViolation(yesterday.toISOString().slice(0, 10), "resolved")).toBe(false);
    expect(isOverdueViolation(null, "open")).toBe(false);
  });
});
