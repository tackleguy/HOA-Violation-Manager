import { describe, expect, it } from "vitest";
import {
  createPropertySchema,
  createResidentSchema,
  createViolationSchema,
  inviteMemberSchema,
  updateNotificationPrefsSchema,
  updateViolationStatusSchema
} from "@/lib/validation/schemas";

const propertyId = "11111111-1111-4111-8111-111111111111";
const residentId = "22222222-2222-4222-8222-222222222222";

describe("validation schemas", () => {
  it("validates resident creation", () => {
    const result = createResidentSchema.safeParse({
      first_name: "Alex",
      last_name: "Rivera",
      email: "",
      phone: "",
      notes: ""
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeNull();
    }
  });

  it("rejects resident without required names", () => {
    const result = createResidentSchema.safeParse({
      first_name: "",
      last_name: "Rivera"
    });
    expect(result.success).toBe(false);
  });

  it("validates property creation with defaults", () => {
    const result = createPropertySchema.safeParse({
      address: "123 Oak Street",
      parcel_number: "",
      section: "A",
      status: "clear"
    });
    expect(result.success).toBe(true);
  });

  it("validates violation creation and optional fields", () => {
    const result = createViolationSchema.safeParse({
      property_id: propertyId,
      resident_id: "",
      category_id: "",
      description: "Unapproved paint color",
      severity: "high",
      due_date: ""
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.resident_id).toBeNull();
      expect(result.data.due_date).toBeNull();
    }
  });

  it("validates violation status updates", () => {
    const result = updateViolationStatusSchema.safeParse({
      id: propertyId,
      status: "resolved"
    });
    expect(result.success).toBe(true);
  });

  it("validates invite member email and role default", () => {
    const result = inviteMemberSchema.safeParse({
      email: "manager@example.com"
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("read_only");
    }
  });

  it("coerces notification preference booleans", () => {
    const result = updateNotificationPrefsSchema.safeParse({
      violation_alerts: true,
      inspection_reminders: false,
      announcement_digest: false,
      escalation_enabled: true
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.violation_alerts).toBe(true);
      expect(result.data.inspection_reminders).toBe(false);
      expect(result.data.announcement_digest).toBe(false);
      expect(result.data.escalation_enabled).toBe(true);
    }
  });

  it("rejects invalid UUID references", () => {
    const result = createViolationSchema.safeParse({
      property_id: "not-a-uuid",
      description: "Test",
      severity: "low"
    });
    expect(result.success).toBe(false);
  });

  it("accepts linked resident UUID on violations", () => {
    const result = createViolationSchema.safeParse({
      property_id: propertyId,
      resident_id: residentId,
      description: "Parking violation",
      severity: "medium"
    });
    expect(result.success).toBe(true);
  });
});
