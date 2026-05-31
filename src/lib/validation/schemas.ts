import { z } from "zod";

export const uuidField = z.string().uuid();
export const optionalUuid = z
  .string()
  .uuid()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value ? value : null));
export const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

export const appRoleSchema = z.enum([
  "super_admin",
  "hoa_admin",
  "board_member",
  "community_manager",
  "inspector",
  "read_only"
]);

export const violationStatusSchema = z.enum([
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
]);

export const violationSeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const architecturalStatusSchema = z.enum([
  "submitted",
  "under_review",
  "board_review",
  "approved",
  "rejected"
]);

export const inspectionStatusSchema = z.enum(["scheduled", "in_progress", "completed", "canceled"]);

export const residentFieldsSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  phone: optionalText,
  notes: optionalText
});

export const createResidentSchema = residentFieldsSchema;
export const updateResidentSchema = residentFieldsSchema.extend({ id: uuidField });
export const deleteResidentSchema = z.object({ id: uuidField });
export const linkPropertySchema = z.object({
  resident_id: uuidField,
  property_id: uuidField,
  owner_type: z.string().trim().min(1).default("owner")
});

export const propertyFieldsSchema = z.object({
  address: z.string().trim().min(1),
  parcel_number: optionalText,
  section: optionalText,
  status: z.string().trim().min(1).default("clear")
});

export const createPropertySchema = propertyFieldsSchema;
export const updatePropertySchema = propertyFieldsSchema.extend({ id: uuidField });
export const deletePropertySchema = z.object({ id: uuidField });

export const violationFieldsSchema = z.object({
  property_id: uuidField,
  resident_id: optionalUuid,
  category_id: optionalUuid,
  description: z.string().trim().min(1),
  severity: violationSeveritySchema.default("medium"),
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))
});

export const createViolationSchema = violationFieldsSchema;
export const updateViolationSchema = violationFieldsSchema.extend({ id: uuidField });
export const updateViolationStatusSchema = z.object({
  id: uuidField,
  status: violationStatusSchema
});
export const deleteViolationSchema = z.object({ id: uuidField });
export const addViolationCommentSchema = z.object({
  violation_id: uuidField,
  body: z.string().trim().min(1)
});
export const violationPhotoSchema = z.object({
  violation_id: uuidField,
  caption: optionalText
});

export const createViolationNoticeSchema = z.object({
  violation_id: uuidField,
  notice_type: z.string().trim().min(1).default("warning"),
  delivery_method: z.string().trim().min(1).default("mail"),
  delivery_status: z.enum(["draft", "sent", "delivered", "failed", "acknowledged"]).default("draft"),
  subject: z.string().trim().min(1),
  body: z.string().trim().min(1)
});

export const createViolationHearingSchema = z.object({
  violation_id: uuidField,
  scheduled_at: z.string().trim().min(1),
  location: optionalText,
  status: z.enum(["scheduled", "completed", "continued", "canceled", "no_show"]).default("scheduled"),
  outcome_notes: optionalText
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
  default_severity: violationSeveritySchema.default("medium")
});

export const deleteCategorySchema = z.object({ id: uuidField });

export const architecturalFieldsSchema = z.object({
  property_id: uuidField,
  resident_id: optionalUuid,
  title: z.string().trim().min(1),
  description: optionalText
});

export const createArchitecturalRequestSchema = architecturalFieldsSchema;
export const updateArchitecturalStatusSchema = z.object({
  id: uuidField,
  status: architecturalStatusSchema,
  decision_notes: optionalText
});
export const architecturalFileSchema = z.object({
  request_id: uuidField
});

export const inspectionFieldsSchema = z.object({
  title: z.string().trim().min(1),
  scheduled_for: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  template_id: optionalUuid,
  assigned_to: optionalUuid
});

export const createInspectionSchema = inspectionFieldsSchema;
export const updateInspectionSchema = inspectionFieldsSchema.extend({
  id: uuidField,
  status: inspectionStatusSchema.optional()
});
export const completeInspectionSchema = z.object({ id: uuidField });
export const createInspectionReportSchema = z.object({
  inspection_id: uuidField,
  notes: optionalText,
  recommendations: optionalText,
  findings: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })
});
export const inspectionReportPhotoSchema = z.object({
  report_id: uuidField,
  caption: optionalText
});

export const documentFieldsSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  visibility: z.string().trim().min(1).default("residents")
});

export const createDocumentSchema = documentFieldsSchema;
export const updateDocumentSchema = documentFieldsSchema.extend({ id: uuidField });
export const deleteDocumentSchema = z.object({ id: uuidField });
export const documentVersionSchema = z.object({
  document_id: uuidField,
  version_label: z.string().trim().min(1)
});

export const announcementFieldsSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  audience: z.string().trim().min(1).default("all")
});

export const createAnnouncementSchema = announcementFieldsSchema;
export const publishAnnouncementSchema = z.object({ id: uuidField });

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1),
  contact_email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  contact_phone: optionalText
});

export const updateNotificationPrefsSchema = z.object({
  violation_alerts: z.coerce.boolean().default(true),
  inspection_reminders: z.coerce.boolean().default(true),
  announcement_digest: z.coerce.boolean().default(false),
  escalation_enabled: z.coerce.boolean().default(true)
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email(),
  role: appRoleSchema.default("read_only")
});

export const updateMemberRoleSchema = z.object({
  membership_id: uuidField,
  role: appRoleSchema,
  status: z.enum(["invited", "active", "suspended"]).optional()
});

export const markNotificationReadSchema = z.object({ id: uuidField });

export const recordIdSchema = z.object({ id: uuidField });

export const fineStatusSchema = z.enum(["issued", "paid", "waived", "overdue"]);

export const workOrderStatusSchema = z.enum(["open", "assigned", "in_progress", "completed", "canceled"]);

export const workOrderPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const meetingStatusSchema = z.enum(["scheduled", "in_progress", "completed", "canceled"]);

export const meetingTypeSchema = z.enum(["regular", "special", "emergency"]);

export const vendorStatusSchema = z.enum(["active", "inactive"]);

export const fineFieldsSchema = z.object({
  violation_id: optionalUuid,
  property_id: uuidField,
  resident_id: optionalUuid,
  amount: z.coerce.number().positive(),
  description: z.string().trim().min(1),
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))
});

export const createFineSchema = fineFieldsSchema;
export const updateFineSchema = fineFieldsSchema.extend({ id: uuidField });
export const updateFineStatusSchema = z.object({
  id: uuidField,
  status: fineStatusSchema
});
export const deleteFineSchema = z.object({ id: uuidField });
export const recordFinePaymentSchema = z.object({
  fine_id: uuidField,
  amount: z.coerce.number().positive(),
  payment_method: z.string().trim().min(1),
  reference_number: optionalText
});

export const meetingFieldsSchema = z.object({
  title: z.string().trim().min(1),
  meeting_type: meetingTypeSchema.default("regular"),
  scheduled_at: z.string().trim().min(1),
  location: optionalText,
  agenda_summary: optionalText,
  minutes_summary: optionalText
});

export const createMeetingSchema = meetingFieldsSchema;
export const updateMeetingSchema = meetingFieldsSchema.extend({ id: uuidField });
export const updateMeetingStatusSchema = z.object({
  id: uuidField,
  status: meetingStatusSchema
});
export const deleteMeetingSchema = z.object({ id: uuidField });
export const addAgendaItemSchema = z.object({
  meeting_id: uuidField,
  sort_order: z.coerce.number().int().min(0).default(0),
  title: z.string().trim().min(1),
  description: optionalText,
  presenter: optionalText,
  duration_minutes: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : null))
});

export const vendorFieldsSchema = z.object({
  name: z.string().trim().min(1),
  category: optionalText,
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  phone: optionalText,
  notes: optionalText,
  status: vendorStatusSchema.default("active")
});

export const createVendorSchema = vendorFieldsSchema;
export const updateVendorSchema = vendorFieldsSchema.extend({ id: uuidField });
export const deleteVendorSchema = z.object({ id: uuidField });

export const workOrderFieldsSchema = z.object({
  property_id: optionalUuid,
  title: z.string().trim().min(1),
  description: optionalText,
  category: z.string().trim().min(1).default("maintenance"),
  priority: workOrderPrioritySchema.default("medium"),
  assigned_to: optionalUuid,
  vendor_id: optionalUuid,
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null))
});

export const createWorkOrderSchema = workOrderFieldsSchema;
export const updateWorkOrderSchema = workOrderFieldsSchema.extend({ id: uuidField });
export const updateWorkOrderStatusSchema = z.object({
  id: uuidField,
  status: workOrderStatusSchema
});
export const deleteWorkOrderSchema = z.object({ id: uuidField });
export const addWorkOrderCommentSchema = z.object({
  work_order_id: uuidField,
  body: z.string().trim().min(1)
});
