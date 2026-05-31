import { format, formatDistanceToNow, subMonths, startOfMonth } from "date-fns";
import {
  activityFeed,
  architecturalRequests as demoArchitecturalRequests,
  documents as demoDocuments,
  inspections as demoInspections,
  metrics as demoMetrics,
  properties as demoProperties,
  residents as demoResidents,
  trendData as demoTrendData,
  violations as demoViolations
} from "@/lib/demo-data";
import { roles } from "@/lib/constants";
import {
  countOutstandingFines,
  countOverdueViolations,
  countScheduledHearings
} from "@/lib/services/violation-workflow-service";
import { ACTIVE_VIOLATION_STATUSES } from "@/lib/violation-workflow";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

type DashboardData = {
  metrics: typeof demoMetrics;
  activityFeed: typeof activityFeed;
};

export type TrendPoint = {
  month: string;
  violations: number;
  resolved: number;
  inspections: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const context = await getTenantContext();
  if (!context) return { metrics: demoMetrics, activityFeed };

  const { supabase, organizationId } = context;
  const [
    activeViolations,
    resolvedViolations,
    overdueViolations,
    scheduledHearings,
    outstandingFines,
    scheduledInspections,
    logs
  ] = await Promise.all([
      supabase
        .from("violations")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .in("status", ACTIVE_VIOLATION_STATUSES),
      supabase.from("violations").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "resolved"),
      countOverdueViolations(),
      countScheduledHearings(),
      countOutstandingFines(),
      supabase
        .from("inspections")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .in("status", ["scheduled", "in_progress"]),
      supabase
        .from("activity_logs")
        .select("action, target_table, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

  return {
    metrics: [
      { label: "Open violations", value: String(activeViolations.count ?? 0), delta: "Active workflow items" },
      { label: "Resolved violations", value: String(resolvedViolations.count ?? 0), delta: "Closed compliance work" },
      { label: "Overdue violations", value: String(overdueViolations), delta: "Past due date" },
      { label: "Scheduled hearings", value: String(scheduledHearings), delta: "Upcoming violation hearings" },
      { label: "Outstanding fines", value: String(outstandingFines), delta: "Issued or overdue" },
      { label: "Scheduled inspections", value: String(scheduledInspections.count ?? 0), delta: "Upcoming and in progress" }
    ],
    activityFeed:
      logs.data?.map((log) => ({
        title: titleize(log.action),
        meta: `${log.target_table ?? "system"} · ${formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}`
      })) ?? activityFeed
  };
}

export async function getTrendData(): Promise<TrendPoint[]> {
  const context = await getTenantContext();
  if (!context) return demoTrendData;

  const months = Array.from({ length: 6 }, (_, index) => startOfMonth(subMonths(new Date(), 5 - index)));
  const fromDate = months[0].toISOString();

  const [violations, inspections] = await Promise.all([
    context.supabase
      .from("violations")
      .select("created_at, resolved_at, status")
      .eq("organization_id", context.organizationId)
      .gte("created_at", fromDate),
    context.supabase
      .from("inspections")
      .select("created_at, status")
      .eq("organization_id", context.organizationId)
      .gte("created_at", fromDate)
  ]);

  return months.map((monthStart) => {
    const monthEnd = startOfMonth(subMonths(monthStart, -1));
    const label = format(monthStart, "MMM");

    const monthViolations =
      violations.data?.filter((row) => {
        const created = new Date(row.created_at);
        return created >= monthStart && created < monthEnd;
      }) ?? [];

    const resolvedCount = monthViolations.filter((row) => {
      if (!row.resolved_at) return row.status === "resolved" || row.status === "closed";
      const resolved = new Date(row.resolved_at);
      return resolved >= monthStart && resolved < monthEnd;
    }).length;

    const inspectionCount =
      inspections.data?.filter((row) => {
        const created = new Date(row.created_at);
        return created >= monthStart && created < monthEnd;
      }).length ?? 0;

    return {
      month: label,
      violations: monthViolations.length,
      resolved: resolvedCount,
      inspections: inspectionCount
    };
  });
}

export async function getResidentRows() {
  const context = await getTenantContext();
  if (!context) return demoResidents;

  const { data: residents } = await context.supabase
    .from("residents")
    .select("id, first_name, last_name, email, phone")
    .eq("organization_id", context.organizationId)
    .order("last_name");

  if (!residents?.length) return demoResidents;

  const residentIds = residents.map((resident) => resident.id);
  const [{ data: owners }, { data: violations }] = await Promise.all([
    context.supabase
      .from("property_owners")
      .select("resident_id, property_id, owner_type, end_date")
      .eq("organization_id", context.organizationId)
      .in("resident_id", residentIds)
      .is("end_date", null),
    context.supabase.from("violations").select("resident_id").eq("organization_id", context.organizationId).in("resident_id", residentIds)
  ]);

  const propertyIds = [...new Set((owners ?? []).map((owner) => owner.property_id))];
  const { data: properties } = propertyIds.length
    ? await context.supabase.from("properties").select("id, address").in("id", propertyIds)
    : { data: [] as { id: string; address: string }[] };

  const addressByPropertyId = new Map((properties ?? []).map((property) => [property.id, property.address]));
  const ownerByResidentId = new Map((owners ?? []).map((owner) => [owner.resident_id, owner]));
  const violationCountByResidentId = new Map<string, number>();
  for (const violation of violations ?? []) {
    if (!violation.resident_id) continue;
    violationCountByResidentId.set(violation.resident_id, (violationCountByResidentId.get(violation.resident_id) ?? 0) + 1);
  }

  return residents.map((resident) => {
    const owner = ownerByResidentId.get(resident.id);
    const propertyLabel = owner ? (addressByPropertyId.get(owner.property_id) ?? "Unassigned") : "Unassigned";
    const ownerType = owner?.owner_type ? titleize(owner.owner_type) : "Unassigned";
    return {
      _id: resident.id,
      _href: `/dashboard/residents/${resident.id}`,
      name: `${resident.first_name} ${resident.last_name}`,
      property: propertyLabel,
      email: resident.email ?? "No email",
      status: resident.phone ? ownerType : "Needs phone",
      violations: violationCountByResidentId.get(resident.id) ?? 0
    };
  });
}

export async function getPropertyRows() {
  const context = await getTenantContext();
  if (!context) return demoProperties;

  const { data: properties } = await context.supabase
    .from("properties")
    .select("id, address, parcel_number, section, status")
    .eq("organization_id", context.organizationId)
    .order("address");

  if (!properties?.length) return demoProperties;

  const propertyIds = properties.map((property) => property.id);
  const { data: owners } = await context.supabase
    .from("property_owners")
    .select("property_id, resident_id, end_date")
    .eq("organization_id", context.organizationId)
    .in("property_id", propertyIds)
    .is("end_date", null);

  const residentIds = [...new Set((owners ?? []).map((owner) => owner.resident_id))];
  const { data: residents } = residentIds.length
    ? await context.supabase.from("residents").select("id, first_name, last_name").in("id", residentIds)
    : { data: [] as { id: string; first_name: string; last_name: string }[] };

  const residentById = new Map((residents ?? []).map((resident) => [resident.id, resident]));
  const ownerByPropertyId = new Map((owners ?? []).map((owner) => [owner.property_id, owner]));

  return properties.map((property) => {
    const owner = ownerByPropertyId.get(property.id);
    const resident = owner ? residentById.get(owner.resident_id) : undefined;
    const ownerName = resident ? `${resident.first_name} ${resident.last_name}` : null;
    return {
      _id: property.id,
      _href: `/dashboard/properties/${property.id}`,
      address: property.address,
      parcel: property.parcel_number ?? "Unassigned",
      section: property.section ?? "General",
      status: ownerName ? `${titleize(property.status)} · ${ownerName}` : titleize(property.status)
    };
  });
}

export async function getViolationRows() {
  const context = await getTenantContext();
  if (!context) return demoViolations;

  const { data: violations } = await context.supabase
    .from("violations")
    .select("id, description, severity, status, due_date, property_id, resident_id, category_id")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!violations?.length) return demoViolations;

  const propertyIds = [...new Set(violations.map((row) => row.property_id))];
  const residentIds = [...new Set(violations.map((row) => row.resident_id).filter(Boolean))] as string[];
  const categoryIds = [...new Set(violations.map((row) => row.category_id).filter(Boolean))] as string[];

  const [{ data: properties }, { data: residents }, { data: categories }] = await Promise.all([
    context.supabase.from("properties").select("id, address").in("id", propertyIds),
    residentIds.length ? context.supabase.from("residents").select("id, first_name, last_name").in("id", residentIds) : Promise.resolve({ data: [] }),
    categoryIds.length
      ? context.supabase.from("violation_categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [] })
  ]);

  const addressById = new Map((properties ?? []).map((row) => [row.id, row.address]));
  const residentById = new Map((residents ?? []).map((row) => [row.id, row]));
  const categoryById = new Map((categories ?? []).map((row) => [row.id, row.name]));

  return violations.map((violation) => {
    const resident = violation.resident_id ? residentById.get(violation.resident_id) : undefined;
    return {
      _id: violation.id,
      _href: `/dashboard/violations/${violation.id}`,
      category: (violation.category_id && categoryById.get(violation.category_id)) ?? "Uncategorized",
      property: addressById.get(violation.property_id) ?? violation.description.slice(0, 40),
      severity: titleize(violation.severity),
      status: titleize(violation.status),
      due: violation.due_date ?? "No due date",
      resident: resident ? `${resident.first_name} ${resident.last_name}` : "Unassigned"
    };
  });
}

export async function getArchitecturalRows() {
  const context = await getTenantContext();
  if (!context) return demoArchitecturalRequests;

  const { data: requests } = await context.supabase
    .from("architectural_requests")
    .select("id, title, status, decision_notes, property_id, resident_id")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!requests?.length) return demoArchitecturalRequests;

  const propertyIds = [...new Set(requests.map((row) => row.property_id))];
  const residentIds = [...new Set(requests.map((row) => row.resident_id).filter(Boolean))] as string[];

  const [{ data: properties }, { data: residents }] = await Promise.all([
    context.supabase.from("properties").select("id, address").in("id", propertyIds),
    residentIds.length ? context.supabase.from("residents").select("id, first_name, last_name").in("id", residentIds) : Promise.resolve({ data: [] })
  ]);

  const addressById = new Map((properties ?? []).map((row) => [row.id, row.address]));
  const residentById = new Map((residents ?? []).map((row) => [row.id, row]));

  return requests.map((request) => {
    const resident = request.resident_id ? residentById.get(request.resident_id) : undefined;
    return {
      _id: request.id,
      _href: `/dashboard/architecture/${request.id}`,
      title: request.title,
      property: addressById.get(request.property_id) ?? "Linked property",
      status: titleize(request.status),
      reviewer: request.decision_notes ?? (resident ? `${resident.first_name} ${resident.last_name}` : "Pending review")
    };
  });
}

export async function getInspectionRows() {
  const context = await getTenantContext();
  if (!context) return demoInspections;

  const { data: inspections } = await context.supabase
    .from("inspections")
    .select("id, title, scheduled_for, status, assigned_to")
    .eq("organization_id", context.organizationId)
    .order("scheduled_for", { ascending: true })
    .limit(25);

  if (!inspections?.length) return demoInspections;

  const assigneeIds = [...new Set(inspections.map((row) => row.assigned_to).filter(Boolean))] as string[];
  const { data: profiles } = assigneeIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", assigneeIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const nameByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return inspections.map((inspection) => ({
    _id: inspection.id,
    _href: `/dashboard/inspections/${inspection.id}`,
    title: inspection.title,
    date: inspection.scheduled_for ? new Date(inspection.scheduled_for).toLocaleDateString() : "Unscheduled",
    assignee:
      (inspection.assigned_to && nameByUserId.get(inspection.assigned_to)) ??
      (inspection.assigned_to ? `User ${inspection.assigned_to.slice(0, 8)}` : "Unassigned"),
    completion: inspection.status === "completed" ? "100%" : inspection.status === "in_progress" ? "50%" : "0%"
  }));
}

export async function getDocumentRows() {
  const context = await getTenantContext();
  if (!context) return demoDocuments;

  const { data: documents } = await context.supabase
    .from("documents")
    .select("id, name, category, visibility")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (!documents?.length) return demoDocuments;

  const documentIds = documents.map((document) => document.id);
  const { data: versions } = await context.supabase
    .from("document_versions")
    .select("document_id, version_label, created_at")
    .eq("organization_id", context.organizationId)
    .in("document_id", documentIds)
    .order("created_at", { ascending: false });

  const latestVersionByDocumentId = new Map<string, { version_label: string; created_at: string }>();
  for (const version of versions ?? []) {
    if (!latestVersionByDocumentId.has(version.document_id)) {
      latestVersionByDocumentId.set(version.document_id, version);
    }
  }

  return documents.map((document) => {
    const latestVersion = latestVersionByDocumentId.get(document.id);
    return {
      _id: document.id,
      _href: `/dashboard/documents/${document.id}`,
      name: document.name,
      category: document.category,
      version: latestVersion?.version_label ?? "No version",
      access: titleize(document.visibility)
    };
  });
}

export async function getAnnouncementRows() {
  const context = await getTenantContext();
  if (!context) {
    return [
      { title: "Pool maintenance", audience: "All residents", status: "Scheduled", sent: "Jun 8" },
      { title: "Board meeting reminder", audience: "Board", status: "Sent", sent: "May 29" },
      { title: "Gate code update", audience: "Owners", status: "Draft", sent: "Pending" }
    ];
  }

  const { data } = await context.supabase
    .from("announcements")
    .select("title, audience, published_at, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    data?.map((announcement) => ({
      title: announcement.title,
      audience: titleize(announcement.audience),
      status: announcement.published_at ? "Sent" : "Draft",
      sent: announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : "Pending"
    })) ?? []
  );
}

export async function getActivityRows() {
  const context = await getTenantContext();
  if (!context) {
    return [
      { event: "Violation updated", actor: "Avery Collins", target: "9013 Lake Vista", time: "3 minutes ago" },
      { event: "User invited", actor: "Nadia Shah", target: "Inspector", time: "21 minutes ago" },
      { event: "Document downloaded", actor: "Graham Ellis", target: "CC&Rs", time: "1 hour ago" }
    ];
  }

  const { data: logs } = await context.supabase
    .from("activity_logs")
    .select("action, actor_id, target_table, target_id, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!logs?.length) return [];

  const actorIds = [...new Set(logs.map((log) => log.actor_id).filter(Boolean))] as string[];
  const { data: profiles } = actorIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return logs.map((log) => ({
    event: titleize(log.action),
    actor:
      (log.actor_id && nameByUserId.get(log.actor_id)) ?? (log.actor_id ? `User ${log.actor_id.slice(0, 8)}` : "System"),
    target: log.target_table ? `${titleize(log.target_table)}${log.target_id ? ` ${log.target_id.slice(0, 8)}` : ""}` : "System",
    time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
  }));
}

export async function getMemberRows() {
  const context = await getTenantContext();
  if (!context) {
    return roles.map((role, index) => ({
      name: ["Avery Collins", "Nadia Shah", "Graham Ellis", "Sam Rivera", "Jordan Lee", "Read Only Auditor"][index],
      role: titleize(role),
      status: index < 5 ? "Active" : "Invited",
      access: index === 0 ? "Global" : "Evergreen Ridge"
    }));
  }

  const { data: memberships } = await context.supabase
    .from("memberships")
    .select("id, user_id, role, status, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!memberships?.length) return [];

  const userIds = memberships.map((membership) => membership.user_id);
  const { data: profiles } = await context.supabase.from("profiles").select("id, full_name, email").in("id", userIds);
  const profileByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return memberships.map((membership) => {
    const profile = profileByUserId.get(membership.user_id);
    return {
      name: profile?.full_name ?? profile?.email ?? `User ${membership.user_id.slice(0, 8)}`,
      role: titleize(membership.role),
      status: titleize(membership.status),
      access: "Current HOA"
    };
  });
}

export async function getNotificationRows() {
  const { getNotificationRows: loadNotifications } = await import("@/lib/services/notification-service");
  const rows = await loadNotifications();
  return rows.map((row) => ({
    title: row.title,
    body: row.body,
    status: row.read ? "Read" : "Unread",
    sent: row.time
  }));
}

export async function getResidentDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: resident } = await context.supabase
    .from("residents")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!resident) return null;

  const [{ data: propertyOwners }, { data: violations }] = await Promise.all([
    context.supabase.from("property_owners").select("*").eq("resident_id", id).eq("organization_id", context.organizationId),
    context.supabase.from("violations").select("id, status, severity, description, created_at").eq("resident_id", id).eq("organization_id", context.organizationId)
  ]);

  const propertyIds = [...new Set((propertyOwners ?? []).map((owner) => owner.property_id))];
  const { data: properties } = propertyIds.length
    ? await context.supabase.from("properties").select("id, address, status").in("id", propertyIds)
    : { data: [] };
  const propertyById = new Map((properties ?? []).map((property) => [property.id, property]));

  return {
    ...resident,
    property_owners: (propertyOwners ?? []).map((owner) => ({
      ...owner,
      properties: propertyById.get(owner.property_id) ?? null
    })),
    violations: violations ?? []
  };
}

export async function getPropertyDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: property } = await context.supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!property) return null;

  const [{ data: propertyOwners }, { data: violations }] = await Promise.all([
    context.supabase.from("property_owners").select("*").eq("property_id", id).eq("organization_id", context.organizationId),
    context.supabase.from("violations").select("id, status, severity, description, due_date, created_at").eq("property_id", id).eq("organization_id", context.organizationId)
  ]);

  const residentIds = [...new Set((propertyOwners ?? []).map((owner) => owner.resident_id))];
  const { data: residents } = residentIds.length
    ? await context.supabase.from("residents").select("id, first_name, last_name, email, phone").in("id", residentIds)
    : { data: [] };
  const residentById = new Map((residents ?? []).map((resident) => [resident.id, resident]));

  return {
    ...property,
    property_owners: (propertyOwners ?? []).map((owner) => ({
      ...owner,
      residents: residentById.get(owner.resident_id) ?? null
    })),
    violations: violations ?? []
  };
}

export async function getViolationDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: violation } = await context.supabase
    .from("violations")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!violation) return null;

  const [{ data: property }, { data: resident }, { data: category }, { data: photos }, { data: comments }] = await Promise.all([
    context.supabase.from("properties").select("id, address").eq("id", violation.property_id).maybeSingle(),
    violation.resident_id
      ? context.supabase.from("residents").select("id, first_name, last_name, email").eq("id", violation.resident_id).maybeSingle()
      : Promise.resolve({ data: null }),
    violation.category_id
      ? context.supabase.from("violation_categories").select("id, name, default_severity").eq("id", violation.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    context.supabase.from("violation_photos").select("id, storage_path, caption, created_at").eq("violation_id", id),
    context.supabase.from("violation_comments").select("id, body, created_at, created_by").eq("violation_id", id).order("created_at", { ascending: false })
  ]);

  const commentAuthorIds = [...new Set((comments ?? []).map((comment) => comment.created_by).filter(Boolean))] as string[];
  const { data: profiles } = commentAuthorIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", commentAuthorIds)
    : { data: [] };
  const nameByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return {
    ...violation,
    properties: property,
    residents: resident,
    violation_categories: category,
    violation_photos: photos ?? [],
    violation_comments: (comments ?? []).map((comment) => ({
      ...comment,
      profiles: comment.created_by ? { full_name: nameByUserId.get(comment.created_by) ?? null } : null
    }))
  };
}

export async function getArchitecturalDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: request } = await context.supabase
    .from("architectural_requests")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!request) return null;

  const [{ data: property }, { data: resident }, { data: files }] = await Promise.all([
    context.supabase.from("properties").select("id, address").eq("id", request.property_id).maybeSingle(),
    request.resident_id
      ? context.supabase.from("residents").select("id, first_name, last_name").eq("id", request.resident_id).maybeSingle()
      : Promise.resolve({ data: null }),
    context.supabase.from("architectural_request_files").select("id, file_name, storage_path, created_at").eq("request_id", id)
  ]);

  return {
    ...request,
    properties: property,
    residents: resident,
    architectural_request_files: files ?? []
  };
}

export async function getInspectionDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: inspection } = await context.supabase
    .from("inspections")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!inspection) return null;

  const [{ data: assignee }, { data: reports }] = await Promise.all([
    inspection.assigned_to
      ? context.supabase.from("profiles").select("full_name, email").eq("id", inspection.assigned_to).maybeSingle()
      : Promise.resolve({ data: null }),
    context.supabase
      .from("inspection_reports")
      .select("id, findings, notes, recommendations, created_at")
      .eq("inspection_id", id)
      .order("created_at", { ascending: false })
  ]);

  return {
    ...inspection,
    profiles: assignee,
    inspection_reports: reports ?? []
  };
}

export async function getDocumentDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: document } = await context.supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!document) return null;

  const { data: versions } = await context.supabase
    .from("document_versions")
    .select("id, version_label, storage_path, created_at, uploaded_by")
    .eq("document_id", id)
    .order("created_at", { ascending: false });

  const uploaderIds = [...new Set((versions ?? []).map((version) => version.uploaded_by).filter(Boolean))] as string[];
  const { data: profiles } = uploaderIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", uploaderIds)
    : { data: [] };
  const nameByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return {
    ...document,
    document_versions: (versions ?? []).map((version) => ({
      ...version,
      profiles: version.uploaded_by ? { full_name: nameByUserId.get(version.uploaded_by) ?? null } : null
    }))
  };
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
