import { hasSupabasePublicEnv } from "@/lib/env";
import { formatDate, formatLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type SearchEntityType =
  | "resident"
  | "property"
  | "violation"
  | "document"
  | "meeting"
  | "work_order";

export type SearchResult = {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  status: string | null;
  href: string;
  score: number;
};

export type SearchFilters = {
  types?: SearchEntityType[];
  status?: string;
};

export type SearchResponse = {
  query: string;
  total: number;
  results: SearchResult[];
  facets: { type: SearchEntityType; count: number }[];
};

const demoResults: SearchResult[] = [
  {
    id: "demo-resident-1",
    type: "resident",
    title: "Marisol Bennett",
    subtitle: "1844 Cypress Bend · marisol@example.com",
    status: "Owner",
    href: "/dashboard/residents",
    score: 95
  },
  {
    id: "demo-property-1",
    type: "property",
    title: "9013 Lake Vista",
    subtitle: "Parcel LV-9013 · Lakeside section",
    status: "Violation",
    href: "/dashboard/properties",
    score: 88
  },
  {
    id: "demo-violation-1",
    type: "violation",
    title: "Parking — guest vehicle overnight",
    subtitle: "9013 Lake Vista · Medium severity",
    status: "Warning Sent",
    href: "/dashboard/violations",
    score: 82
  },
  {
    id: "demo-document-1",
    type: "document",
    title: "Community Rules",
    subtitle: "Community Rules · v4 · Residents",
    status: "Published",
    href: "/dashboard/documents",
    score: 76
  },
  {
    id: "demo-meeting-1",
    type: "meeting",
    title: "Board meeting reminder",
    subtitle: "Board audience · Sent May 29",
    status: "Scheduled",
    href: "/dashboard/communications",
    score: 70
  },
  {
    id: "demo-work-1",
    type: "work_order",
    title: "Gate repair follow-up",
    subtitle: "North entrance latch replacement",
    status: "In progress",
    href: "/dashboard/work-orders",
    score: 65
  }
];

export async function globalSearch(
  query: string,
  filters: SearchFilters = {},
  limit = 50
): Promise<SearchResponse> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { query: "", total: 0, results: [], facets: [] };
  }

  const context = await getTenantContext();
  if (!context) return searchDemo(normalized, filters, limit);

  const { supabase, organizationId } = context;
  const allowedTypes = filters.types?.length ? new Set(filters.types) : null;
  const pattern = `%${escapeIlike(normalized)}%`;
  const results: SearchResult[] = [];

  const searches: Promise<void>[] = [];

  if (!allowedTypes || allowedTypes.has("resident")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("residents")
          .select("id, first_name, last_name, email, phone")
          .eq("organization_id", organizationId)
          .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`)
          .limit(limit);
        for (const row of data ?? []) {
          results.push({
            id: row.id,
            type: "resident",
            title: `${row.first_name} ${row.last_name}`,
            subtitle: [row.email, row.phone].filter(Boolean).join(" · ") || "No contact info",
            status: null,
            href: `/dashboard/residents/${row.id}`,
            score: scoreMatch(normalized, [row.first_name, row.last_name, row.email, row.phone])
          });
        }
      })()
    );
  }

  if (!allowedTypes || allowedTypes.has("property")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("properties")
          .select("id, address, parcel_number, section, status")
          .eq("organization_id", organizationId)
          .or(`address.ilike.${pattern},parcel_number.ilike.${pattern},section.ilike.${pattern}`)
          .limit(limit);
        for (const row of data ?? []) {
          if (filters.status && row.status !== filters.status) continue;
          results.push({
            id: row.id,
            type: "property",
            title: row.address,
            subtitle: [row.parcel_number, row.section].filter(Boolean).join(" · ") || "No parcel",
            status: formatLabel(row.status),
            href: `/dashboard/properties/${row.id}`,
            score: scoreMatch(normalized, [row.address, row.parcel_number, row.section])
          });
        }
      })()
    );
  }

  if (!allowedTypes || allowedTypes.has("violation")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("violations")
          .select("id, description, status, severity, property_id, due_date")
          .eq("organization_id", organizationId)
          .ilike("description", pattern)
          .limit(limit);
        const propertyIds = [...new Set((data ?? []).map((v) => v.property_id))];
        const { data: properties } = propertyIds.length
          ? await supabase.from("properties").select("id, address").in("id", propertyIds)
          : { data: [] as { id: string; address: string }[] };
        const addressById = new Map((properties ?? []).map((p) => [p.id, p.address]));
        for (const row of data ?? []) {
          if (filters.status && row.status !== filters.status) continue;
          results.push({
            id: row.id,
            type: "violation",
            title: row.description.slice(0, 80),
            subtitle: `${addressById.get(row.property_id) ?? "Property"} · Due ${formatDate(row.due_date)}`,
            status: formatLabel(row.status),
            href: `/dashboard/violations/${row.id}`,
            score: scoreMatch(normalized, [row.description, row.severity, row.status])
          });
        }
      })()
    );
  }

  if (!allowedTypes || allowedTypes.has("document")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("documents")
          .select("id, name, category, visibility")
          .eq("organization_id", organizationId)
          .or(`name.ilike.${pattern},category.ilike.${pattern}`)
          .limit(limit);
        for (const row of data ?? []) {
          results.push({
            id: row.id,
            type: "document",
            title: row.name,
            subtitle: `${row.category} · ${formatLabel(row.visibility)} access`,
            status: formatLabel(row.visibility),
            href: `/dashboard/documents/${row.id}`,
            score: scoreMatch(normalized, [row.name, row.category, row.visibility])
          });
        }
      })()
    );
  }

  if (!allowedTypes || allowedTypes.has("meeting")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("board_meetings")
          .select("id, title, meeting_type, scheduled_at, location, status, agenda_summary")
          .eq("organization_id", organizationId)
          .or(`title.ilike.${pattern},agenda_summary.ilike.${pattern},location.ilike.${pattern}`)
          .limit(limit);
        for (const row of data ?? []) {
          if (filters.status && row.status !== filters.status) continue;
          results.push({
            id: row.id,
            type: "meeting",
            title: row.title,
            subtitle: `${formatLabel(row.meeting_type)} · ${formatDate(row.scheduled_at)}`,
            status: formatLabel(row.status),
            href: `/dashboard/meetings/${row.id}`,
            score: scoreMatch(normalized, [row.title, row.agenda_summary, row.location, row.meeting_type])
          });
        }
      })()
    );
  }

  if (!allowedTypes || allowedTypes.has("work_order")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("work_orders")
          .select("id, title, description, status, property_id, category, priority")
          .eq("organization_id", organizationId)
          .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
          .limit(limit);
        const propertyIds = [...new Set((data ?? []).map((r) => r.property_id).filter(Boolean))] as string[];
        const { data: properties } = propertyIds.length
          ? await supabase.from("properties").select("id, address").in("id", propertyIds)
          : { data: [] as { id: string; address: string }[] };
        const addressById = new Map((properties ?? []).map((p) => [p.id, p.address]));
        for (const row of data ?? []) {
          if (filters.status && row.status !== filters.status) continue;
          results.push({
            id: row.id,
            type: "work_order",
            title: row.title,
            subtitle: row.property_id ? (addressById.get(row.property_id) ?? "Property") : "Community-wide",
            status: formatLabel(row.status),
            href: `/dashboard/work-orders/${row.id}`,
            score: scoreMatch(normalized, [row.title, row.description, row.category, row.priority])
          });
        }
      })()
    );
  }

  await Promise.all(searches);

  const sorted = results.sort((a, b) => b.score - a.score).slice(0, limit);
  const facetMap = new Map<SearchEntityType, number>();
  for (const result of sorted) {
    facetMap.set(result.type, (facetMap.get(result.type) ?? 0) + 1);
  }

  return {
    query: normalized,
    total: sorted.length,
    results: sorted,
    facets: [...facetMap.entries()].map(([type, count]) => ({ type, count }))
  };
}

export async function searchSuggestions(query: string, limit = 8): Promise<string[]> {
  const response = await globalSearch(query, {}, limit);
  return response.results.map((result) => result.title).slice(0, limit);
}

function searchDemo(query: string, filters: SearchFilters, limit: number): SearchResponse {
  const allowedTypes = filters.types?.length ? new Set(filters.types) : null;
  const filtered = demoResults.filter((result) => {
    if (allowedTypes && !allowedTypes.has(result.type)) return false;
    if (filters.status && result.status !== filters.status) return false;
    const haystack = `${result.title} ${result.subtitle} ${result.status ?? ""}`.toLowerCase();
    return haystack.includes(query);
  });
  const results = filtered.slice(0, limit);
  const facetMap = new Map<SearchEntityType, number>();
  for (const result of results) {
    facetMap.set(result.type, (facetMap.get(result.type) ?? 0) + 1);
  }
  return {
    query,
    total: results.length,
    results,
    facets: [...facetMap.entries()].map(([type, count]) => ({ type, count }))
  };
}

function scoreMatch(query: string, fields: (string | null | undefined)[]) {
  let score = 0;
  for (const field of fields) {
    if (!field) continue;
    const normalized = field.toLowerCase();
    if (normalized === query) score += 100;
    else if (normalized.startsWith(query)) score += 80;
    else if (normalized.includes(query)) score += 50;
  }
  return score;
}

function escapeIlike(value: string) {
  return value.replace(/[%_\\]/g, "\\$&");
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
