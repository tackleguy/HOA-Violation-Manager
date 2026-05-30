import { addDays, endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { hasSupabasePublicEnv } from "@/lib/env";
import { formatLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type CalendarEventType = "inspection" | "meeting" | "violation" | "work_order";

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  status: string;
  href: string;
  meta: string;
};

export type CalendarFilters = {
  types?: CalendarEventType[];
  status?: string;
};

export type CalendarMonthSummary = {
  month: string;
  totalEvents: number;
  byType: Record<CalendarEventType, number>;
  events: CalendarEvent[];
};

const demoEvents: CalendarEvent[] = [
  {
    id: "demo-inspection-1",
    type: "inspection",
    title: "Monthly exterior sweep",
    description: "North and south perimeter walkthrough",
    date: format(new Date(), "yyyy-MM-dd"),
    endDate: null,
    status: "scheduled",
    href: "/dashboard/inspections",
    meta: "Assigned to Avery Collins"
  },
  {
    id: "demo-meeting-1",
    type: "meeting",
    title: "Board meeting",
    description: "Quarterly budget and compliance review",
    date: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    endDate: null,
    status: "scheduled",
    href: "/dashboard/communications",
    meta: "Board audience"
  },
  {
    id: "demo-violation-1",
    type: "violation",
    title: "Violation due: Parking",
    description: "9013 Lake Vista — guest vehicle overnight",
    date: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    endDate: null,
    status: "warning_sent",
    href: "/dashboard/violations",
    meta: "Medium severity"
  },
  {
    id: "demo-work-1",
    type: "work_order",
    title: "Gate repair follow-up",
    description: "Complete latch replacement at north entrance",
    date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    endDate: null,
    status: "in_progress",
    href: "/dashboard/architecture",
    meta: "Maintenance work order"
  },
  {
    id: "demo-inspection-2",
    type: "inspection",
    title: "Pool safety checklist",
    description: "Seasonal pool and deck inspection",
    date: format(addDays(new Date(), 10), "yyyy-MM-dd"),
    endDate: null,
    status: "scheduled",
    href: "/dashboard/inspections",
    meta: "Assigned to Jordan Lee"
  },
  {
    id: "demo-meeting-2",
    type: "meeting",
    title: "Architectural review committee",
    description: "Review pending exterior modification requests",
    date: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    endDate: null,
    status: "scheduled",
    href: "/dashboard/architecture",
    meta: "Committee session"
  }
];

export async function getCalendarEvents(from: Date, to: Date, filters: CalendarFilters = {}): Promise<CalendarEvent[]> {
  const context = await getTenantContext();
  if (!context) return filterDemoEvents(from, to, filters);

  const { supabase, organizationId } = context;
  const fromIso = from.toISOString();
  const toIso = to.toISOString();
  const allowedTypes = filters.types?.length ? new Set(filters.types) : null;

  const [inspections, violations, meetings, workOrders] = await Promise.all([
    supabase
      .from("inspections")
      .select("id, title, scheduled_for, status, assigned_to")
      .eq("organization_id", organizationId)
      .gte("scheduled_for", fromIso)
      .lte("scheduled_for", toIso)
      .order("scheduled_for"),
    supabase
      .from("violations")
      .select("id, description, due_date, status, severity, property_id")
      .eq("organization_id", organizationId)
      .not("due_date", "is", null)
      .gte("due_date", format(from, "yyyy-MM-dd"))
      .lte("due_date", format(to, "yyyy-MM-dd")),
    supabase
      .from("board_meetings")
      .select("id, title, meeting_type, scheduled_at, location, status, agenda_summary")
      .eq("organization_id", organizationId)
      .gte("scheduled_at", fromIso)
      .lte("scheduled_at", toIso)
      .order("scheduled_at"),
    supabase
      .from("work_orders")
      .select("id, title, description, status, due_date, property_id, category, priority")
      .eq("organization_id", organizationId)
      .not("due_date", "is", null)
      .gte("due_date", format(from, "yyyy-MM-dd"))
      .lte("due_date", format(to, "yyyy-MM-dd"))
      .in("status", ["open", "assigned", "in_progress"])
  ]);

  const propertyIds = [
    ...new Set([
      ...(violations.data ?? []).map((v) => v.property_id),
      ...(workOrders.data ?? []).map((r) => r.property_id).filter(Boolean)
    ])
  ] as string[];
  const { data: properties } = propertyIds.length
    ? await supabase.from("properties").select("id, address").in("id", propertyIds)
    : { data: [] as { id: string; address: string }[] };
  const addressById = new Map((properties ?? []).map((p) => [p.id, p.address]));

  const events: CalendarEvent[] = [];

  if (!allowedTypes || allowedTypes.has("inspection")) {
    for (const row of inspections.data ?? []) {
      if (!row.scheduled_for) continue;
      if (filters.status && row.status !== filters.status) continue;
      events.push({
        id: `inspection-${row.id}`,
        type: "inspection",
        title: row.title,
        description: null,
        date: row.scheduled_for.slice(0, 10),
        endDate: null,
        status: row.status,
        href: `/dashboard/inspections/${row.id}`,
        meta: row.assigned_to ? "Assigned inspector" : "Unassigned"
      });
    }
  }

  if (!allowedTypes || allowedTypes.has("violation")) {
    for (const row of violations.data ?? []) {
      if (!row.due_date) continue;
      if (filters.status && row.status !== filters.status) continue;
      const address = addressById.get(row.property_id) ?? "Property";
      events.push({
        id: `violation-${row.id}`,
        type: "violation",
        title: `Violation due: ${row.description.slice(0, 48)}`,
        description: address,
        date: row.due_date,
        endDate: null,
        status: row.status,
        href: `/dashboard/violations/${row.id}`,
        meta: `${formatLabel(row.severity)} severity`
      });
    }
  }

  if (!allowedTypes || allowedTypes.has("meeting")) {
    for (const row of meetings.data ?? []) {
      if (filters.status && row.status !== filters.status) continue;
      events.push({
        id: `meeting-${row.id}`,
        type: "meeting",
        title: row.title,
        description: row.agenda_summary?.slice(0, 120) ?? row.location,
        date: row.scheduled_at.slice(0, 10),
        endDate: null,
        status: row.status,
        href: `/dashboard/meetings/${row.id}`,
        meta: row.location ? `${formatLabel(row.meeting_type)} · ${row.location}` : formatLabel(row.meeting_type)
      });
    }
  }

  if (!allowedTypes || allowedTypes.has("work_order")) {
    for (const row of workOrders.data ?? []) {
      if (!row.due_date) continue;
      if (filters.status && row.status !== filters.status) continue;
      const address = row.property_id ? (addressById.get(row.property_id) ?? "Property") : "Community-wide";
      events.push({
        id: `work-order-${row.id}`,
        type: "work_order",
        title: `Work order: ${row.title}`,
        description: row.description?.slice(0, 120) ?? address,
        date: row.due_date,
        endDate: null,
        status: row.status,
        href: `/dashboard/work-orders/${row.id}`,
        meta: `${formatLabel(row.category)} · ${formatLabel(row.priority)} priority`
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getCalendarMonth(referenceDate = new Date()): Promise<CalendarMonthSummary> {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const events = await getCalendarEvents(monthStart, monthEnd);

  const byType: Record<CalendarEventType, number> = {
    inspection: 0,
    meeting: 0,
    violation: 0,
    work_order: 0
  };
  for (const event of events) {
    byType[event.type] += 1;
  }

  return {
    month: format(monthStart, "MMMM yyyy"),
    totalEvents: events.length,
    byType,
    events
  };
}

export async function getUpcomingEvents(limit = 10): Promise<CalendarEvent[]> {
  const today = new Date();
  const horizon = addDays(today, 60);
  const events = await getCalendarEvents(today, horizon);
  return events.filter((event) => event.date >= format(today, "yyyy-MM-dd")).slice(0, limit);
}

export async function getEventsForDate(date: string): Promise<CalendarEvent[]> {
  const parsed = parseISO(date);
  const events = await getCalendarEvents(parsed, parsed);
  return events.filter((event) => event.date === date);
}

function filterDemoEvents(from: Date, to: Date, filters: CalendarFilters) {
  const allowedTypes = filters.types?.length ? new Set(filters.types) : null;
  return demoEvents.filter((event) => {
    const parsed = parseISO(event.date);
    if (!isWithinInterval(parsed, { start: from, end: to })) return false;
    if (allowedTypes && !allowedTypes.has(event.type)) return false;
    if (filters.status && event.status !== filters.status) return false;
    return true;
  });
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
