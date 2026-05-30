import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE_NAME } from "@/lib/org-cookie";
import type { AppRole } from "@/lib/permissions";
import type { Database } from "@/types/database";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

type MembershipSummary = {
  id: string;
  organization_id: string;
  role: AppRole;
  status: string;
  organizations: Pick<OrganizationRow, "id" | "name" | "slug" | "plan"> | null;
};

export type OrganizationContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  organizationId: string;
  role: AppRole;
  membership: MembershipSummary;
  organization: OrganizationRow;
};

export async function getCurrentMemberships() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("memberships")
    .select("id, organization_id, role, status, organizations(id, name, slug, plan)")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) throw error;
  return (data ?? []) as MembershipSummary[];
}

export async function getCurrentOrganizationId() {
  const memberships = await getCurrentMemberships();
  if (!memberships.length) return null;

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(ORG_COOKIE_NAME)?.value;

  if (selectedId && memberships.some((membership) => membership.organization_id === selectedId)) {
    return selectedId;
  }

  return memberships[0]?.organization_id ?? null;
}

export async function getDefaultOrganizationId() {
  return getCurrentOrganizationId();
}

export async function getOrganizationContext(): Promise<OrganizationContext | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("id, organization_id, role, status, organizations(id, name, slug, plan, branding, contact_email, contact_phone, created_at, updated_at)")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership?.organizations) return null;

  const organization = membership.organizations as OrganizationRow;

  return {
    supabase,
    userId: user.id,
    organizationId,
    role: membership.role as AppRole,
    membership: membership as MembershipSummary,
    organization
  };
}
