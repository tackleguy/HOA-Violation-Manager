import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type SelectOption = {
  id: string;
  label: string;
};

export type CategoryOption = SelectOption & {
  default_severity: string;
};

async function getReferenceContext() {
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

export async function getProperties(): Promise<SelectOption[]> {
  const context = await getReferenceContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("properties")
    .select("id, address")
    .eq("organization_id", context.organizationId)
    .order("address");

  return (data ?? []).map((property) => ({
    id: property.id,
    label: property.address
  }));
}

export async function getResidents(): Promise<SelectOption[]> {
  const context = await getReferenceContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("residents")
    .select("id, first_name, last_name")
    .eq("organization_id", context.organizationId)
    .order("last_name");

  return (data ?? []).map((resident) => ({
    id: resident.id,
    label: `${resident.first_name} ${resident.last_name}`
  }));
}

export async function getCategories(): Promise<CategoryOption[]> {
  const context = await getReferenceContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("violation_categories")
    .select("id, name, default_severity")
    .eq("organization_id", context.organizationId)
    .order("name");

  return (data ?? []).map((category) => ({
    id: category.id,
    label: category.name,
    default_severity: category.default_severity
  }));
}
