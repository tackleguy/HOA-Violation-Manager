import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ORG_COOKIE_NAME } from "@/lib/org-cookie";
import { cookies } from "next/headers";

type Supabase = SupabaseClient<Database>;

export type PendingOrganization = {
  organization_name: string;
  organization_slug: string;
};

export function getPendingOrganizationFromMetadata(metadata: Record<string, unknown> | undefined): PendingOrganization | null {
  const name = metadata?.organization_name;
  const slug = metadata?.organization_slug;

  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof slug !== "string" || !slug.trim()) return null;

  return {
    organization_name: name.trim(),
    organization_slug: slug.trim()
  };
}

export function slugifyOrganizationName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "hoa-workspace";
}

export async function userHasActiveMembership(supabase: Supabase, userId: string) {
  const { count, error } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function provisionOrganizationForUser(
  supabase: Supabase,
  pending: PendingOrganization
): Promise<string | null> {
  const { data, error } = await supabase.rpc("create_organization", {
    org_name: pending.organization_name,
    org_slug: pending.organization_slug
  });

  if (error) {
    if (error.message.includes("duplicate key") || error.message.includes("organizations_slug")) {
      const retrySlug = `${pending.organization_slug}-${Date.now().toString(36).slice(-4)}`;
      const { data: retryData, error: retryError } = await supabase.rpc("create_organization", {
        org_name: pending.organization_name,
        org_slug: retrySlug
      });
      if (retryError) throw retryError;
      return retryData;
    }
    throw error;
  }

  return data;
}

export async function setOrganizationCookie(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE_NAME, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}

export async function ensureUserOrganization(supabase: Supabase, userId: string, metadata: Record<string, unknown> | undefined) {
  const hasMembership = await userHasActiveMembership(supabase, userId);
  if (hasMembership) return null;

  const pending = getPendingOrganizationFromMetadata(metadata);
  if (!pending) return null;

  const organizationId = await provisionOrganizationForUser(supabase, pending);
  if (organizationId) {
    await setOrganizationCookie(organizationId);
  }

  return organizationId;
}
