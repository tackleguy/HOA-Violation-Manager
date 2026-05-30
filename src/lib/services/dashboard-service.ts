import { formatDistanceToNow } from "date-fns";
import {
  activityFeed,
  architecturalRequests as demoArchitecturalRequests,
  documents as demoDocuments,
  inspections as demoInspections,
  metrics as demoMetrics,
  properties as demoProperties,
  residents as demoResidents,
  violations as demoViolations
} from "@/lib/demo-data";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

type DashboardData = {
  metrics: typeof demoMetrics;
  activityFeed: typeof activityFeed;
};

export async function getDashboardData(): Promise<DashboardData> {
  const context = await getTenantContext();
  if (!context) return { metrics: demoMetrics, activityFeed };

  const { supabase, organizationId } = context;
  const [properties, residents, activeViolations, resolvedViolations, pendingRequests, scheduledInspections, logs] =
    await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
      supabase.from("residents").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
      supabase.from("violations").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["open", "under_review", "warning_sent", "fine_pending"]),
      supabase.from("violations").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "resolved"),
      supabase.from("architectural_requests").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["submitted", "under_review", "board_review"]),
      supabase.from("inspections").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["scheduled", "in_progress"]),
      supabase.from("activity_logs").select("action, target_table, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(5)
    ]);

  return {
    metrics: [
      { label: "Total properties", value: String(properties.count ?? 0), delta: "Live tenant count" },
      { label: "Total residents", value: String(residents.count ?? 0), delta: "Live tenant count" },
      { label: "Active violations", value: String(activeViolations.count ?? 0), delta: "Open workflow items" },
      { label: "Resolved violations", value: String(resolvedViolations.count ?? 0), delta: "Closed compliance work" },
      { label: "Pending requests", value: String(pendingRequests.count ?? 0), delta: "Needs review" },
      { label: "Scheduled inspections", value: String(scheduledInspections.count ?? 0), delta: "Upcoming and in progress" }
    ],
    activityFeed:
      logs.data?.map((log) => ({
        title: titleize(log.action),
        meta: `${log.target_table ?? "system"} · ${formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}`
      })) ?? activityFeed
  };
}

export async function getResidentRows() {
  const context = await getTenantContext();
  if (!context) return demoResidents;

  const { data } = await context.supabase
    .from("residents")
    .select("first_name, last_name, email, phone")
    .eq("organization_id", context.organizationId)
    .order("last_name");

  return data?.map((resident) => ({
    name: `${resident.first_name} ${resident.last_name}`,
    property: "Unassigned",
    email: resident.email ?? "No email",
    status: resident.phone ? "Contactable" : "Needs phone",
    violations: 0
  })) ?? demoResidents;
}

export async function getPropertyRows() {
  const context = await getTenantContext();
  if (!context) return demoProperties;

  const { data } = await context.supabase
    .from("properties")
    .select("address, parcel_number, section, status")
    .eq("organization_id", context.organizationId)
    .order("address");

  return data?.map((property) => ({
    address: property.address,
    parcel: property.parcel_number ?? "Unassigned",
    section: property.section ?? "General",
    status: titleize(property.status)
  })) ?? demoProperties;
}

export async function getViolationRows() {
  const context = await getTenantContext();
  if (!context) return demoViolations;

  const { data } = await context.supabase
    .from("violations")
    .select("description, severity, status, due_date")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  return data?.map((violation) => ({
    category: "Recorded",
    property: violation.description.slice(0, 40),
    severity: titleize(violation.severity),
    status: titleize(violation.status),
    due: violation.due_date ?? "No due date"
  })) ?? demoViolations;
}

export async function getArchitecturalRows() {
  const context = await getTenantContext();
  if (!context) return demoArchitecturalRequests;

  const { data } = await context.supabase
    .from("architectural_requests")
    .select("title, status, decision_notes")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  return data?.map((request) => ({
    title: request.title,
    property: "Linked property",
    status: titleize(request.status),
    reviewer: request.decision_notes ?? "Pending review"
  })) ?? demoArchitecturalRequests;
}

export async function getInspectionRows() {
  const context = await getTenantContext();
  if (!context) return demoInspections;

  const { data } = await context.supabase
    .from("inspections")
    .select("title, scheduled_for, status")
    .eq("organization_id", context.organizationId)
    .order("scheduled_for", { ascending: true })
    .limit(25);

  return data?.map((inspection) => ({
    title: inspection.title,
    date: inspection.scheduled_for ? new Date(inspection.scheduled_for).toLocaleDateString() : "Unscheduled",
    assignee: "Unassigned",
    completion: inspection.status === "completed" ? "100%" : "0%"
  })) ?? demoInspections;
}

export async function getDocumentRows() {
  const context = await getTenantContext();
  if (!context) return demoDocuments;

  const { data } = await context.supabase
    .from("documents")
    .select("name, category, visibility")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  return data?.map((document) => ({
    name: document.name,
    category: document.category,
    version: "Current",
    access: titleize(document.visibility)
  })) ?? demoDocuments;
}

async function getTenantContext() {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) return null;

  return { supabase, organizationId };
}

function titleize(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
