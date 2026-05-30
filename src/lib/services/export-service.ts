import { format } from "date-fns";
import { hasSupabasePublicEnv } from "@/lib/env";
import { formatDate, formatLabel } from "@/lib/format";
import { buildReportExportData } from "@/lib/services/reports-service";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type ExportEntity =
  | "residents"
  | "properties"
  | "violations"
  | "documents"
  | "inspections"
  | "architectural_requests"
  | "announcements"
  | "work_orders"
  | "board_meetings"
  | "compliance_report"
  | "violation_summary"
  | "financial_summary"
  | "occupancy_stats";

export type CsvExport = {
  filename: string;
  content: string;
  rowCount: number;
  headers: string[];
};

const demoResidents = [
  { first_name: "Marisol", last_name: "Bennett", email: "marisol@example.com", phone: "555-0101", notes: "Board liaison" },
  { first_name: "Owen", last_name: "Palmer", email: "owen@example.com", phone: "555-0102", notes: "" },
  { first_name: "Nadia", last_name: "Shah", email: "nadia@example.com", phone: "555-0103", notes: "Owner since 2019" }
];

const demoProperties = [
  { address: "1844 Cypress Bend", parcel_number: "CB-1844", section: "Cypress", status: "clear" },
  { address: "9013 Lake Vista", parcel_number: "LV-9013", section: "Lakeside", status: "violation" },
  { address: "77 Stonebridge", parcel_number: "SB-0077", section: "Stonebridge", status: "review" }
];

export async function exportEntity(entity: ExportEntity): Promise<CsvExport> {
  if (entity === "compliance_report") return exportReport("compliance");
  if (entity === "violation_summary") return exportReport("violations");
  if (entity === "financial_summary") return exportReport("financial");
  if (entity === "occupancy_stats") return exportReport("occupancy");

  const context = await getTenantContext();
  const timestamp = format(new Date(), "yyyy-MM-dd");

  switch (entity) {
    case "residents":
      return buildResidentsExport(context, timestamp);
    case "properties":
      return buildPropertiesExport(context, timestamp);
    case "violations":
      return buildViolationsExport(context, timestamp);
    case "documents":
      return buildDocumentsExport(context, timestamp);
    case "inspections":
      return buildInspectionsExport(context, timestamp);
    case "architectural_requests":
      return buildArchitecturalRequestsExport(context, timestamp);
    case "announcements":
      return buildAnnouncementsExport(context, timestamp);
    case "work_orders":
      return buildWorkOrdersExport(context, timestamp);
    case "board_meetings":
      return buildBoardMeetingsExport(context, timestamp);
    default:
      throw new Error(`Unsupported export entity: ${entity}`);
  }
}

export function buildCsv(headers: string[], rows: Record<string, string | number | null | undefined>[]): string {
  const escape = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return "";
    const text = String(value);
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header])).join(","));
  }
  return lines.join("\n");
}

async function exportReport(reportType: "compliance" | "violations" | "financial" | "occupancy"): Promise<CsvExport> {
  const dataset = await buildReportExportData(reportType);
  const content = buildCsv(dataset.headers, dataset.rows);
  return {
    filename: `${dataset.entity}-${format(new Date(), "yyyy-MM-dd")}.csv`,
    content,
    rowCount: dataset.rows.length,
    headers: dataset.headers
  };
}

async function buildResidentsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["first_name", "last_name", "email", "phone", "notes"];
  if (!context) {
    const content = buildCsv(headers, demoResidents);
    return { filename: `residents-${timestamp}.csv`, content, rowCount: demoResidents.length, headers };
  }

  const { data } = await context.supabase
    .from("residents")
    .select("first_name, last_name, email, phone, notes")
    .eq("organization_id", context.organizationId)
    .order("last_name");

  const rows = (data ?? []).map((row) => ({
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    notes: row.notes
  }));

  return {
    filename: `residents-${timestamp}.csv`,
    content: buildCsv(headers, rows),
    rowCount: rows.length,
    headers
  };
}

async function buildPropertiesExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["address", "parcel_number", "section", "status"];
  if (!context) {
    const content = buildCsv(headers, demoProperties);
    return { filename: `properties-${timestamp}.csv`, content, rowCount: demoProperties.length, headers };
  }

  const { data } = await context.supabase
    .from("properties")
    .select("address, parcel_number, section, status")
    .eq("organization_id", context.organizationId)
    .order("address");

  const rows = (data ?? []).map((row) => ({
    address: row.address,
    parcel_number: row.parcel_number,
    section: row.section,
    status: row.status
  }));

  return {
    filename: `properties-${timestamp}.csv`,
    content: buildCsv(headers, rows),
    rowCount: rows.length,
    headers
  };
}

async function buildViolationsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["description", "property_address", "resident_name", "category", "severity", "status", "due_date", "created_at"];
  if (!context) {
    const rows = [
      {
        description: "Guest vehicle overnight",
        property_address: "9013 Lake Vista",
        resident_name: "Owen Palmer",
        category: "Parking",
        severity: "medium",
        status: "warning_sent",
        due_date: "2026-06-12",
        created_at: "2026-05-01"
      }
    ];
    return { filename: `violations-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data: violations } = await context.supabase
    .from("violations")
    .select("description, property_id, resident_id, category_id, severity, status, due_date, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  const propertyIds = [...new Set((violations ?? []).map((v) => v.property_id))];
  const residentIds = [...new Set((violations ?? []).map((v) => v.resident_id).filter(Boolean))] as string[];
  const categoryIds = [...new Set((violations ?? []).map((v) => v.category_id).filter(Boolean))] as string[];

  const [{ data: properties }, { data: residents }, { data: categories }] = await Promise.all([
    propertyIds.length ? context.supabase.from("properties").select("id, address").in("id", propertyIds) : Promise.resolve({ data: [] }),
    residentIds.length ? context.supabase.from("residents").select("id, first_name, last_name").in("id", residentIds) : Promise.resolve({ data: [] }),
    categoryIds.length ? context.supabase.from("violation_categories").select("id, name").in("id", categoryIds) : Promise.resolve({ data: [] })
  ]);

  const addressById = new Map((properties ?? []).map((p) => [p.id, p.address]));
  const residentById = new Map((residents ?? []).map((r) => [r.id, `${r.first_name} ${r.last_name}`]));
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const rows = (violations ?? []).map((row) => ({
    description: row.description,
    property_address: addressById.get(row.property_id) ?? "",
    resident_name: row.resident_id ? (residentById.get(row.resident_id) ?? "") : "",
    category: row.category_id ? (categoryById.get(row.category_id) ?? "") : "",
    severity: row.severity,
    status: row.status,
    due_date: row.due_date,
    created_at: row.created_at
  }));

  return { filename: `violations-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

async function buildDocumentsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["name", "category", "visibility", "created_at", "updated_at"];
  if (!context) {
    const rows = [{ name: "Community Rules", category: "Community Rules", visibility: "residents", created_at: "2026-01-01", updated_at: "2026-05-01" }];
    return { filename: `documents-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data } = await context.supabase
    .from("documents")
    .select("name, category, visibility, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("name");

  const rows = (data ?? []).map((row) => ({
    name: row.name,
    category: row.category,
    visibility: row.visibility,
    created_at: row.created_at,
    updated_at: row.updated_at
  }));

  return { filename: `documents-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

async function buildInspectionsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["title", "status", "scheduled_for", "assigned_to", "created_at"];
  if (!context) {
    const rows = [{ title: "Monthly exterior sweep", status: "scheduled", scheduled_for: "2026-06-04", assigned_to: "", created_at: "2026-05-01" }];
    return { filename: `inspections-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data } = await context.supabase
    .from("inspections")
    .select("title, status, scheduled_for, assigned_to, created_at")
    .eq("organization_id", context.organizationId)
    .order("scheduled_for", { ascending: false });

  const rows = (data ?? []).map((row) => ({
    title: row.title,
    status: row.status,
    scheduled_for: row.scheduled_for,
    assigned_to: row.assigned_to,
    created_at: row.created_at
  }));

  return { filename: `inspections-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

async function buildArchitecturalRequestsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["title", "property_address", "status", "description", "created_at", "decided_at"];
  if (!context) {
    const rows = [{ title: "Pergola installation", property_address: "1844 Cypress Bend", status: "approved", description: "Rear patio pergola", created_at: "2026-04-01", decided_at: "2026-05-10" }];
    return { filename: `architectural_requests-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data: requests } = await context.supabase
    .from("architectural_requests")
    .select("title, property_id, status, description, created_at, decided_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  const propertyIds = [...new Set((requests ?? []).map((r) => r.property_id))];
  const { data: properties } = propertyIds.length
    ? await context.supabase.from("properties").select("id, address").in("id", propertyIds)
    : { data: [] as { id: string; address: string }[] };
  const addressById = new Map((properties ?? []).map((p) => [p.id, p.address]));

  const rows = (requests ?? []).map((row) => ({
    title: row.title,
    property_address: addressById.get(row.property_id) ?? "",
    status: row.status,
    description: row.description,
    created_at: row.created_at,
    decided_at: row.decided_at
  }));

  return { filename: `architectural_requests-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

async function buildAnnouncementsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["title", "audience", "published_at", "created_at"];
  if (!context) {
    const rows = [{ title: "Board meeting reminder", audience: "Board", published_at: "2026-05-29", created_at: "2026-05-28" }];
    return { filename: `announcements-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data } = await context.supabase
    .from("announcements")
    .select("title, audience, published_at, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  const rows = (data ?? []).map((row) => ({
    title: row.title,
    audience: row.audience,
    published_at: row.published_at,
    created_at: row.created_at
  }));

  return { filename: `announcements-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

async function buildWorkOrdersExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["title", "property_address", "category", "priority", "status", "due_date"];
  if (!context) {
    const rows = [{ title: "Gate repair follow-up", property_address: "North entrance", category: "maintenance", priority: "high", status: "in_progress", due_date: "2026-06-07" }];
    return { filename: `work_orders-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data: workOrders } = await context.supabase
    .from("work_orders")
    .select("title, property_id, category, priority, status, due_date")
    .eq("organization_id", context.organizationId)
    .order("due_date", { ascending: false });

  const propertyIds = [...new Set((workOrders ?? []).map((r) => r.property_id).filter(Boolean))] as string[];
  const { data: properties } = propertyIds.length
    ? await context.supabase.from("properties").select("id, address").in("id", propertyIds)
    : { data: [] as { id: string; address: string }[] };
  const addressById = new Map((properties ?? []).map((p) => [p.id, p.address]));

  const rows = (workOrders ?? []).map((row) => ({
    title: row.title,
    property_address: row.property_id ? (addressById.get(row.property_id) ?? "") : "Community-wide",
    category: row.category,
    priority: row.priority,
    status: row.status,
    due_date: row.due_date
  }));

  return { filename: `work_orders-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

async function buildBoardMeetingsExport(
  context: Awaited<ReturnType<typeof getTenantContext>>,
  timestamp: string
): Promise<CsvExport> {
  const headers = ["title", "meeting_type", "scheduled_at", "location", "status"];
  if (!context) {
    const rows = [{ title: "Board meeting", meeting_type: "regular", scheduled_at: "2026-06-03T18:00:00Z", location: "Clubhouse", status: "scheduled" }];
    return { filename: `board_meetings-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
  }

  const { data } = await context.supabase
    .from("board_meetings")
    .select("title, meeting_type, scheduled_at, location, status")
    .eq("organization_id", context.organizationId)
    .order("scheduled_at", { ascending: false });

  const rows = (data ?? []).map((row) => ({
    title: row.title,
    meeting_type: row.meeting_type,
    scheduled_at: row.scheduled_at,
    location: row.location,
    status: row.status
  }));

  return { filename: `board_meetings-${timestamp}.csv`, content: buildCsv(headers, rows), rowCount: rows.length, headers };
}

export function getExportEntityLabel(entity: ExportEntity) {
  return formatLabel(entity.replace(/_/g, " "));
}

export const EXPORT_ENTITIES: ExportEntity[] = [
  "residents",
  "properties",
  "violations",
  "documents",
  "inspections",
  "architectural_requests",
  "announcements",
  "work_orders",
  "board_meetings",
  "compliance_report",
  "violation_summary",
  "financial_summary",
  "occupancy_stats"
];

async function getTenantContext() {
  if (!hasSupabasePublicEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) return null;
  return { supabase, organizationId };
}
