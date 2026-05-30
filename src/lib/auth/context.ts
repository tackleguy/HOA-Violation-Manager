import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type AppRole =
  | "super_admin"
  | "hoa_admin"
  | "board_member"
  | "community_manager"
  | "inspector"
  | "read_only";

const WRITE_ROLES: AppRole[] = ["super_admin", "hoa_admin", "board_member", "community_manager", "inspector"];
const MANAGE_ROLES: AppRole[] = ["super_admin", "hoa_admin"];

export type OrgContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  organizationId: string;
  role: AppRole;
};

export async function requireOrgContext(returnTo: string): Promise<OrgContext> {
  if (!hasSupabasePublicEnv()) {
    redirect(`${returnTo}?error=${encodeURIComponent("Supabase environment variables are required before saving records.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) {
    redirect(`${returnTo}?error=${encodeURIComponent("Your account is not assigned to an active HOA workspace.")}`);
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !membership) {
    redirect(`${returnTo}?error=${encodeURIComponent("Your membership is not active for this workspace.")}`);
  }

  return {
    supabase,
    userId: user.id,
    organizationId,
    role: membership.role as AppRole
  };
}

export function requireWritePermission(ctx: OrgContext, returnTo: string) {
  if (!WRITE_ROLES.includes(ctx.role)) {
    redirect(`${returnTo}?error=${encodeURIComponent("You do not have permission to modify records in this workspace.")}`);
  }
}

export function requireManagePermission(ctx: OrgContext, returnTo: string) {
  if (!MANAGE_ROLES.includes(ctx.role)) {
    redirect(`${returnTo}?error=${encodeURIComponent("Only HOA administrators can perform this action.")}`);
  }
}
