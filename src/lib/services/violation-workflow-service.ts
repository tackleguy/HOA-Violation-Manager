import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export async function getViolationNotices(violationId: string) {
  const context = await getContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("violation_notices")
    .select("id, notice_type, delivery_method, delivery_status, subject, body, sent_at, created_at")
    .eq("violation_id", violationId)
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getViolationHearings(violationId: string) {
  const context = await getContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("violation_hearings")
    .select("id, scheduled_at, location, status, outcome_notes, created_at")
    .eq("violation_id", violationId)
    .eq("organization_id", context.organizationId)
    .order("scheduled_at", { ascending: false });

  return data ?? [];
}

export async function getViolationStatusHistory(violationId: string) {
  const context = await getContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("violation_status_history")
    .select("id, from_status, to_status, notes, changed_by, created_at")
    .eq("violation_id", violationId)
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (!data?.length) return [];

  const actorIds = [...new Set(data.map((row) => row.changed_by).filter(Boolean))] as string[];
  const { data: profiles } = actorIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return data.map((row) => ({
    ...row,
    actor_name: row.changed_by ? (nameById.get(row.changed_by) ?? "Staff") : "System"
  }));
}

export async function getViolationLinkedFines(violationId: string) {
  const context = await getContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("fines")
    .select("id, amount_cents, description, status, due_date, issued_at, paid_at")
    .eq("violation_id", violationId)
    .eq("organization_id", context.organizationId)
    .order("issued_at", { ascending: false });

  return data ?? [];
}

export async function countScheduledHearings() {
  const context = await getContext();
  if (!context) return 0;

  const { count } = await context.supabase
    .from("violation_hearings")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", context.organizationId)
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date().toISOString());

  return count ?? 0;
}

export async function countOutstandingFines() {
  const context = await getContext();
  if (!context) return 0;

  const { count } = await context.supabase
    .from("fines")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", context.organizationId)
    .in("status", ["issued", "overdue"]);

  return count ?? 0;
}

export async function countOverdueViolations() {
  const context = await getContext();
  if (!context) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await context.supabase
    .from("violations")
    .select("id, status, due_date")
    .eq("organization_id", context.organizationId)
    .not("status", "in", '("resolved","closed","draft")')
    .lt("due_date", today);

  return data?.length ?? 0;
}

async function getContext() {
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
