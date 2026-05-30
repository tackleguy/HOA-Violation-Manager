import { describe, expect, it } from "vitest";
import { parseCsv, stringifyCsv } from "@/lib/utils/csv";

describe("csv utils", () => {
  it("parses CSV with headers", () => {
    const input = "name,email\nAlex,alex@example.com\nJamie,jamie@example.com";
    const rows = parseCsv(input);
    expect(rows).toEqual([
      { name: "Alex", email: "alex@example.com" },
      { name: "Jamie", email: "jamie@example.com" }
    ]);
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const input = 'address,notes\n"123 Main St, Unit 4","Said ""hello"""';
    const rows = parseCsv(input);
    expect(rows[0].address).toBe("123 Main St, Unit 4");
    expect(rows[0].notes).toBe('Said "hello"');
  });

  it("stringifies rows with escaping", () => {
    const csv = stringifyCsv([
      { name: "Alex", note: "Needs follow-up" },
      { name: "Jamie", note: "Closed, resolved" }
    ]);
    expect(csv).toContain("name,note");
    expect(csv).toContain('"Closed, resolved"');
  });

  it("supports custom delimiter", () => {
    const csv = stringifyCsv([{ a: "1", b: "2" }], { delimiter: ";" });
    expect(csv).toBe("a;b\n1;2");
  });

  it("returns empty array for blank input", () => {
    expect(parseCsv("   \n\n")).toEqual([]);
  });

  it("round-trips data", () => {
    const original = [
      { id: "1", address: "10 Oak Lane" },
      { id: "2", address: "22 Pine Court" }
    ];
    const csv = stringifyCsv(original, { headers: ["id", "address"] });
    const parsed = parseCsv(csv);
    expect(parsed).toEqual(original);
  });
});
