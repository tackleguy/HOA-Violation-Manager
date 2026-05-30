import { hasSupabasePublicEnv } from "@/lib/env";
import { formatDate, formatLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type SelectOption = {
  id: string;
  label: string;
};

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

export async function getWorkOrderRows() {
  const context = await getTenantContext();
  if (!context) return [];

  const { data: workOrders } = await context.supabase
    .from("work_orders")
    .select("id, title, category, priority, status, due_date, property_id, assigned_to, vendor_id")
    .eq("organization_id", context.organizationId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(25);

  if (!workOrders?.length) return [];

  const propertyIds = [...new Set(workOrders.map((row) => row.property_id).filter(Boolean))] as string[];
  const assigneeIds = [...new Set(workOrders.map((row) => row.assigned_to).filter(Boolean))] as string[];
  const vendorIds = [...new Set(workOrders.map((row) => row.vendor_id).filter(Boolean))] as string[];

  const [{ data: properties }, { data: profiles }, { data: vendors }] = await Promise.all([
    propertyIds.length
      ? context.supabase.from("properties").select("id, address").in("id", propertyIds)
      : Promise.resolve({ data: [] as { id: string; address: string }[] }),
    assigneeIds.length
      ? context.supabase.from("profiles").select("id, full_name").in("id", assigneeIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    vendorIds.length
      ? context.supabase.from("vendors").select("id, name").in("id", vendorIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] })
  ]);

  const addressById = new Map((properties ?? []).map((row) => [row.id, row.address]));
  const nameByUserId = new Map((profiles ?? []).map((row) => [row.id, row.full_name]));
  const vendorById = new Map((vendors ?? []).map((row) => [row.id, row.name]));

  return workOrders.map((workOrder) => ({
    _id: workOrder.id,
    _href: `/dashboard/work-orders/${workOrder.id}`,
    title: workOrder.title,
    category: formatLabel(workOrder.category),
    priority: formatLabel(workOrder.priority),
    status: formatLabel(workOrder.status),
    due: formatDate(workOrder.due_date),
    property: workOrder.property_id ? (addressById.get(workOrder.property_id) ?? "Linked property") : "Community-wide",
    assignee:
      (workOrder.assigned_to && nameByUserId.get(workOrder.assigned_to)) ??
      (workOrder.vendor_id ? (vendorById.get(workOrder.vendor_id) ?? "Vendor assigned") : "Unassigned")
  }));
}

export async function getWorkOrderDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: workOrder } = await context.supabase
    .from("work_orders")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!workOrder) return null;

  const [{ data: property }, { data: assignee }, { data: vendor }, { data: comments }] = await Promise.all([
    workOrder.property_id
      ? context.supabase.from("properties").select("id, address").eq("id", workOrder.property_id).maybeSingle()
      : Promise.resolve({ data: null }),
    workOrder.assigned_to
      ? context.supabase.from("profiles").select("id, full_name, email").eq("id", workOrder.assigned_to).maybeSingle()
      : Promise.resolve({ data: null }),
    workOrder.vendor_id
      ? context.supabase.from("vendors").select("id, name, email, phone").eq("id", workOrder.vendor_id).maybeSingle()
      : Promise.resolve({ data: null }),
    context.supabase
      .from("work_order_comments")
      .select("id, body, created_at, created_by")
      .eq("work_order_id", id)
      .order("created_at", { ascending: false })
  ]);

  const authorIds = [...new Set((comments ?? []).map((comment) => comment.created_by).filter(Boolean))] as string[];
  const { data: profiles } = authorIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", authorIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return {
    ...workOrder,
    properties: property,
    assignee,
    vendors: vendor,
    work_order_comments: (comments ?? []).map((comment) => ({
      ...comment,
      profiles: comment.created_by ? { full_name: nameByUserId.get(comment.created_by) ?? null } : null
    }))
  };
}

export async function getAssigneeOptions(): Promise<SelectOption[]> {
  const context = await getTenantContext();
  if (!context) return [];

  const { data: memberships } = await context.supabase
    .from("memberships")
    .select("user_id")
    .eq("organization_id", context.organizationId)
    .eq("status", "active");

  const userIds = [...new Set((memberships ?? []).map((membership) => membership.user_id))];
  if (!userIds.length) return [];

  const { data: profiles } = await context.supabase.from("profiles").select("id, full_name, email").in("id", userIds);

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    label: profile.full_name ?? profile.email ?? `User ${profile.id.slice(0, 8)}`
  }));
}

export async function getVendorOptions(): Promise<SelectOption[]> {
  const context = await getTenantContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("vendors")
    .select("id, name")
    .eq("organization_id", context.organizationId)
    .eq("status", "active")
    .order("name");

  return (data ?? []).map((vendor) => ({
    id: vendor.id,
    label: vendor.name
  }));
}
