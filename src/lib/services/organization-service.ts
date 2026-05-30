import { createClient } from "@/lib/supabase/server";

type MembershipSummary = {
  id: string;
  organization_id: string;
  role: string;
  status: string;
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

export async function getDefaultOrganizationId() {
  const memberships = await getCurrentMemberships();
  return memberships[0]?.organization_id ?? null;
}
