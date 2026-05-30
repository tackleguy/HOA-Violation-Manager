import { format, startOfMonth, subMonths } from "date-fns";
import { hasSupabasePublicEnv } from "@/lib/env";
import { formatLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type ComplianceReport = {
  period: string;
  totalViolations: number;
  resolvedViolations: number;
  openViolations: number;
  resolutionRate: number;
  onTimeRate: number;
  byCategory: { category: string; count: number; resolved: number }[];
  bySeverity: { severity: string; count: number }[];
  trend: { month: string; opened: number; resolved: number }[];
};

export type ViolationSummary = {
  active: number;
  underReview: number;
  warningSent: number;
  finePending: number;
  resolved: number;
  closed: number;
  overdue: number;
  avgResolutionDays: number;
  topCategories: { name: string; count: number }[];
};

export type FinancialSummary = {
  period: string;
  assessedFines: number;
  collectedFines: number;
  outstandingFines: number;
  collectionRate: number;
  pendingRequests: number;
  approvedRequests: number;
  monthlyAssessments: { month: string; assessed: number; collected: number }[];
};

export type OccupancyStats = {
  totalProperties: number;
  occupied: number;
  vacant: number;
  occupancyRate: number;
  bySection: { section: string; total: number; occupied: number }[];
  byStatus: { status: string; count: number }[];
  ownerTypes: { type: string; count: number }[];
};

export type ExportDataset = {
  entity: string;
  headers: string[];
  rows: Record<string, string | number | null>[];
  generatedAt: string;
};

const demoCompliance: ComplianceReport = {
  period: "Last 6 months",
  totalViolations: 251,
  resolvedViolations: 214,
  openViolations: 37,
  resolutionRate: 85,
  onTimeRate: 92,
  byCategory: [
    { category: "Parking", count: 68, resolved: 58 },
    { category: "Landscaping", count: 54, resolved: 49 },
    { category: "Trash bins", count: 41, resolved: 36 },
    { category: "Exterior maintenance", count: 38, resolved: 32 },
    { category: "Noise complaints", count: 28, resolved: 24 },
    { category: "Pet violations", count: 22, resolved: 15 }
  ],
  bySeverity: [
    { severity: "low", count: 98 },
    { severity: "medium", count: 89 },
    { severity: "high", count: 44 },
    { severity: "critical", count: 20 }
  ],
  trend: [
    { month: "Jan", opened: 44, resolved: 36 },
    { month: "Feb", opened: 39, resolved: 34 },
    { month: "Mar", opened: 51, resolved: 48 },
    { month: "Apr", opened: 47, resolved: 53 },
    { month: "May", opened: 37, resolved: 49 },
    { month: "Jun", opened: 33, resolved: 46 }
  ]
};

const demoViolationSummary: ViolationSummary = {
  active: 37,
  underReview: 12,
  warningSent: 9,
  finePending: 4,
  resolved: 214,
  closed: 18,
  overdue: 6,
  avgResolutionDays: 14,
  topCategories: [
    { name: "Parking", count: 68 },
    { name: "Landscaping", count: 54 },
    { name: "Trash bins", count: 41 }
  ]
};

const demoFinancial: FinancialSummary = {
  period: "Year to date",
  assessedFines: 12450,
  collectedFines: 9820,
  outstandingFines: 2630,
  collectionRate: 79,
  pendingRequests: 16,
  approvedRequests: 42,
  monthlyAssessments: [
    { month: "Jan", assessed: 1850, collected: 1620 },
    { month: "Feb", assessed: 1920, collected: 1710 },
    { month: "Mar", assessed: 2100, collected: 1890 },
    { month: "Apr", assessed: 2050, collected: 1840 },
    { month: "May", assessed: 2280, collected: 1520 },
    { month: "Jun", assessed: 2250, collected: 1240 }
  ]
};

const demoOccupancy: OccupancyStats = {
  totalProperties: 428,
  occupied: 401,
  vacant: 27,
  occupancyRate: 94,
  bySection: [
    { section: "Cypress", total: 112, occupied: 108 },
    { section: "Lakeside", total: 98, occupied: 91 },
    { section: "Stonebridge", total: 86, occupied: 82 },
    { section: "Mesa", total: 74, occupied: 70 },
    { section: "Unassigned", total: 58, occupied: 50 }
  ],
  byStatus: [
    { status: "clear", count: 356 },
    { status: "violation", count: 45 },
    { status: "review", count: 27 }
  ],
  ownerTypes: [
    { type: "owner", count: 312 },
    { type: "tenant", count: 89 },
    { type: "board", count: 12 }
  ]
};

export async function getComplianceReport(): Promise<ComplianceReport> {
  const context = await getTenantContext();
  if (!context) return demoCompliance;

  const { supabase, organizationId } = context;
  const fromDate = subMonths(new Date(), 6).toISOString();

  const [{ data: violations }, { data: categories }] = await Promise.all([
    supabase
      .from("violations")
      .select("id, status, severity, category_id, created_at, resolved_at, due_date")
      .eq("organization_id", organizationId)
      .gte("created_at", fromDate),
    supabase.from("violation_categories").select("id, name").eq("organization_id", organizationId)
  ]);

  const rows = violations ?? [];
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const openStatuses = new Set(["open", "under_review", "warning_sent", "fine_pending"]);
  const resolvedRows = rows.filter((r) => r.status === "resolved" || r.status === "closed");
  const openRows = rows.filter((r) => openStatuses.has(r.status));

  const onTimeResolved = resolvedRows.filter((r) => {
    if (!r.due_date || !r.resolved_at) return true;
    return new Date(r.resolved_at) <= new Date(r.due_date);
  }).length;

  const categoryCounts = new Map<string, { count: number; resolved: number }>();
  for (const row of rows) {
    const name = row.category_id ? (categoryById.get(row.category_id) ?? "Uncategorized") : "Uncategorized";
    const current = categoryCounts.get(name) ?? { count: 0, resolved: 0 };
    current.count += 1;
    if (row.status === "resolved" || row.status === "closed") current.resolved += 1;
    categoryCounts.set(name, current);
  }

  const severityCounts = new Map<string, number>();
  for (const row of rows) {
    severityCounts.set(row.severity, (severityCounts.get(row.severity) ?? 0) + 1);
  }

  const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
  const trend = months.map((monthStart) => {
    const monthEnd = startOfMonth(subMonths(monthStart, -1));
    const opened = rows.filter((r) => {
      const created = new Date(r.created_at);
      return created >= monthStart && created < monthEnd;
    }).length;
    const resolved = rows.filter((r) => {
      if (!r.resolved_at) return false;
      const resolvedAt = new Date(r.resolved_at);
      return resolvedAt >= monthStart && resolvedAt < monthEnd;
    }).length;
    return { month: format(monthStart, "MMM"), opened, resolved };
  });

  const total = rows.length;
  const resolved = resolvedRows.length;

  return {
    period: "Last 6 months",
    totalViolations: total,
    resolvedViolations: resolved,
    openViolations: openRows.length,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    onTimeRate: resolved ? Math.round((onTimeResolved / resolved) * 100) : 0,
    byCategory: [...categoryCounts.entries()]
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.count - a.count),
    bySeverity: [...severityCounts.entries()].map(([severity, count]) => ({ severity, count })),
    trend
  };
}

export async function getViolationSummary(): Promise<ViolationSummary> {
  const context = await getTenantContext();
  if (!context) return demoViolationSummary;

  const { supabase, organizationId } = context;
  const [{ data: violations }, { data: categories }] = await Promise.all([
    supabase
      .from("violations")
      .select("id, status, category_id, created_at, resolved_at, due_date")
      .eq("organization_id", organizationId),
    supabase.from("violation_categories").select("id, name").eq("organization_id", organizationId)
  ]);

  const rows = violations ?? [];
  const now = new Date();
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const categoryCounts = new Map<string, number>();

  for (const row of rows) {
    if (!row.category_id) continue;
    const name = categoryById.get(row.category_id) ?? "Uncategorized";
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }

  const resolvedWithDuration = rows.filter((r) => r.resolved_at);
  const avgResolutionDays = resolvedWithDuration.length
    ? Math.round(
        resolvedWithDuration.reduce((sum, r) => {
          const days = (new Date(r.resolved_at!).getTime() - new Date(r.created_at).getTime()) / 86400000;
          return sum + days;
        }, 0) / resolvedWithDuration.length
      )
    : 0;

  const countStatus = (status: string) => rows.filter((r) => r.status === status).length;
  const overdue = rows.filter(
    (r) => r.due_date && new Date(r.due_date) < now && !["resolved", "closed"].includes(r.status)
  ).length;

  return {
    active: countStatus("open"),
    underReview: countStatus("under_review"),
    warningSent: countStatus("warning_sent"),
    finePending: countStatus("fine_pending"),
    resolved: countStatus("resolved"),
    closed: countStatus("closed"),
    overdue,
    avgResolutionDays,
    topCategories: [...categoryCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  };
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
  const context = await getTenantContext();
  if (!context) return demoFinancial;

  const { supabase, organizationId } = context;
  const fromDate = startOfMonth(subMonths(new Date(), 5)).toISOString();

  const [{ data: violations }, { data: requests }] = await Promise.all([
    supabase
      .from("violations")
      .select("status, severity, created_at, resolved_at")
      .eq("organization_id", organizationId)
      .gte("created_at", fromDate),
    supabase
      .from("architectural_requests")
      .select("status, created_at")
      .eq("organization_id", organizationId)
  ]);

  const fineAmountBySeverity: Record<string, number> = { low: 50, medium: 100, high: 250, critical: 500 };
  const violationRows = violations ?? [];
  const assessedFines = violationRows
    .filter((r) => ["fine_pending", "resolved", "closed"].includes(r.status))
    .reduce((sum, r) => sum + (fineAmountBySeverity[r.severity] ?? 100), 0);
  const collectedFines = violationRows
    .filter((r) => r.status === "resolved" || r.status === "closed")
    .reduce((sum, r) => sum + (fineAmountBySeverity[r.severity] ?? 100), 0);
  const outstandingFines = assessedFines - collectedFines;

  const requestRows = requests ?? [];
  const months = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
  const monthlyAssessments = months.map((monthStart) => {
    const monthEnd = startOfMonth(subMonths(monthStart, -1));
    const monthViolations = violationRows.filter((r) => {
      const created = new Date(r.created_at);
      return created >= monthStart && created < monthEnd && ["fine_pending", "resolved", "closed"].includes(r.status);
    });
    const assessed = monthViolations.reduce((sum, r) => sum + (fineAmountBySeverity[r.severity] ?? 100), 0);
    const collected = monthViolations
      .filter((r) => r.status === "resolved" || r.status === "closed")
      .reduce((sum, r) => sum + (fineAmountBySeverity[r.severity] ?? 100), 0);
    return { month: format(monthStart, "MMM"), assessed, collected };
  });

  return {
    period: "Year to date",
    assessedFines,
    collectedFines,
    outstandingFines,
    collectionRate: assessedFines ? Math.round((collectedFines / assessedFines) * 100) : 0,
    pendingRequests: requestRows.filter((r) => ["submitted", "under_review", "board_review"].includes(r.status)).length,
    approvedRequests: requestRows.filter((r) => r.status === "approved").length,
    monthlyAssessments
  };
}

export async function getOccupancyStats(): Promise<OccupancyStats> {
  const context = await getTenantContext();
  if (!context) return demoOccupancy;

  const { supabase, organizationId } = context;
  const [{ data: properties }, { data: owners }] = await Promise.all([
    supabase.from("properties").select("id, section, status").eq("organization_id", organizationId),
    supabase
      .from("property_owners")
      .select("property_id, owner_type, end_date")
      .eq("organization_id", organizationId)
      .is("end_date", null)
  ]);

  const propertyRows = properties ?? [];
  const ownerRows = owners ?? [];
  const occupiedPropertyIds = new Set(ownerRows.map((o) => o.property_id));
  const total = propertyRows.length;
  const occupied = propertyRows.filter((p) => occupiedPropertyIds.has(p.id)).length;

  const sectionMap = new Map<string, { total: number; occupied: number }>();
  for (const property of propertyRows) {
    const section = property.section?.trim() || "Unassigned";
    const current = sectionMap.get(section) ?? { total: 0, occupied: 0 };
    current.total += 1;
    if (occupiedPropertyIds.has(property.id)) current.occupied += 1;
    sectionMap.set(section, current);
  }

  const statusMap = new Map<string, number>();
  for (const property of propertyRows) {
    statusMap.set(property.status, (statusMap.get(property.status) ?? 0) + 1);
  }

  const ownerTypeMap = new Map<string, number>();
  for (const owner of ownerRows) {
    ownerTypeMap.set(owner.owner_type, (ownerTypeMap.get(owner.owner_type) ?? 0) + 1);
  }

  return {
    totalProperties: total,
    occupied,
    vacant: total - occupied,
    occupancyRate: total ? Math.round((occupied / total) * 100) : 0,
    bySection: [...sectionMap.entries()].map(([section, stats]) => ({ section, ...stats })),
    byStatus: [...statusMap.entries()].map(([status, count]) => ({ status: formatLabel(status), count })),
    ownerTypes: [...ownerTypeMap.entries()].map(([type, count]) => ({ type: formatLabel(type), count }))
  };
}

export async function buildReportExportData(reportType: "compliance" | "violations" | "financial" | "occupancy"): Promise<ExportDataset> {
  const generatedAt = new Date().toISOString();

  switch (reportType) {
    case "compliance": {
      const report = await getComplianceReport();
      return {
        entity: "compliance_report",
        generatedAt,
        headers: ["category", "total", "resolved", "resolution_rate"],
        rows: report.byCategory.map((row) => ({
          category: row.category,
          total: row.count,
          resolved: row.resolved,
          resolution_rate: row.count ? Math.round((row.resolved / row.count) * 100) : 0
        }))
      };
    }
    case "violations": {
      const summary = await getViolationSummary();
      return {
        entity: "violation_summary",
        generatedAt,
        headers: ["metric", "value"],
        rows: [
          { metric: "Active", value: summary.active },
          { metric: "Under review", value: summary.underReview },
          { metric: "Warning sent", value: summary.warningSent },
          { metric: "Fine pending", value: summary.finePending },
          { metric: "Resolved", value: summary.resolved },
          { metric: "Closed", value: summary.closed },
          { metric: "Overdue", value: summary.overdue },
          { metric: "Avg resolution days", value: summary.avgResolutionDays }
        ]
      };
    }
    case "financial": {
      const financial = await getFinancialSummary();
      return {
        entity: "financial_summary",
        generatedAt,
        headers: ["month", "assessed", "collected"],
        rows: financial.monthlyAssessments.map((row) => ({
          month: row.month,
          assessed: row.assessed,
          collected: row.collected
        }))
      };
    }
    case "occupancy": {
      const occupancy = await getOccupancyStats();
      return {
        entity: "occupancy_stats",
        generatedAt,
        headers: ["section", "total", "occupied", "vacant", "occupancy_rate"],
        rows: occupancy.bySection.map((row) => ({
          section: row.section,
          total: row.total,
          occupied: row.occupied,
          vacant: row.total - row.occupied,
          occupancy_rate: row.total ? Math.round((row.occupied / row.total) * 100) : 0
        }))
      };
    }
  }
}

export async function getReportsDashboard() {
  const [compliance, violations, financial, occupancy] = await Promise.all([
    getComplianceReport(),
    getViolationSummary(),
    getFinancialSummary(),
    getOccupancyStats()
  ]);
  return { compliance, violations, financial, occupancy };
}

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
