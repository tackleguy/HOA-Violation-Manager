import { hasSupabasePublicEnv } from "@/lib/env";
import { formatLabel } from "@/lib/format";
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

export async function getVendorRows() {
  const context = await getTenantContext();
  if (!context) return [];

  const { data: vendors } = await context.supabase
    .from("vendors")
    .select("id, name, category, email, phone, status")
    .eq("organization_id", context.organizationId)
    .order("name")
    .limit(25);

  if (!vendors?.length) return [];

  return vendors.map((vendor) => ({
    _id: vendor.id,
    name: vendor.name,
    category: vendor.category ? formatLabel(vendor.category) : "General",
    email: vendor.email ?? "No email",
    phone: vendor.phone ?? "No phone",
    status: formatLabel(vendor.status)
  }));
}

export async function getVendorDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: vendor } = await context.supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!vendor) return null;

  const { data: workOrders } = await context.supabase
    .from("work_orders")
    .select("id, title, status, priority, due_date")
    .eq("vendor_id", id)
    .eq("organization_id", context.organizationId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(10);

  return {
    ...vendor,
    work_orders: workOrders ?? []
  };
}

export async function getVendors(): Promise<SelectOption[]> {
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
