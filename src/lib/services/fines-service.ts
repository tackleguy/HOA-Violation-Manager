import { hasSupabasePublicEnv } from "@/lib/env";
import { formatDate, formatLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
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

export async function getFineRows() {
  const context = await getTenantContext();
  if (!context) return [];

  const { data: fines } = await context.supabase
    .from("fines")
    .select("id, description, amount_cents, status, due_date, property_id, resident_id, violation_id, issued_at")
    .eq("organization_id", context.organizationId)
    .order("issued_at", { ascending: false })
    .limit(25);

  if (!fines?.length) return [];

  const propertyIds = [...new Set(fines.map((row) => row.property_id))];
  const residentIds = [...new Set(fines.map((row) => row.resident_id).filter(Boolean))] as string[];

  const [{ data: properties }, { data: residents }] = await Promise.all([
    context.supabase.from("properties").select("id, address").in("id", propertyIds),
    residentIds.length
      ? context.supabase.from("residents").select("id, first_name, last_name").in("id", residentIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string; last_name: string }[] })
  ]);

  const addressById = new Map((properties ?? []).map((row) => [row.id, row.address]));
  const residentById = new Map((residents ?? []).map((row) => [row.id, row]));

  return fines.map((fine) => {
    const resident = fine.resident_id ? residentById.get(fine.resident_id) : undefined;
    return {
      _id: fine.id,
      _href: `/dashboard/fines/${fine.id}`,
      property: addressById.get(fine.property_id) ?? "Unknown property",
      amount: formatCurrency(fine.amount_cents),
      status: formatLabel(fine.status),
      due: formatDate(fine.due_date),
      resident: resident ? `${resident.first_name} ${resident.last_name}` : "Unassigned"
    };
  });
}

export async function getFineDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: fine } = await context.supabase
    .from("fines")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!fine) return null;

  const [{ data: property }, { data: resident }, { data: violation }, { data: payments }] = await Promise.all([
    context.supabase.from("properties").select("id, address").eq("id", fine.property_id).maybeSingle(),
    fine.resident_id
      ? context.supabase.from("residents").select("id, first_name, last_name, email").eq("id", fine.resident_id).maybeSingle()
      : Promise.resolve({ data: null }),
    fine.violation_id
      ? context.supabase.from("violations").select("id, description, status").eq("id", fine.violation_id).maybeSingle()
      : Promise.resolve({ data: null }),
    context.supabase
      .from("fine_payments")
      .select("id, amount_cents, payment_method, reference_number, created_at, recorded_by")
      .eq("fine_id", id)
      .order("created_at", { ascending: false })
  ]);

  const recorderIds = [...new Set((payments ?? []).map((payment) => payment.recorded_by).filter(Boolean))] as string[];
  const { data: profiles } = recorderIds.length
    ? await context.supabase.from("profiles").select("id, full_name").in("id", recorderIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const nameByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));

  return {
    ...fine,
    properties: property,
    residents: resident,
    violations: violation,
    fine_payments: (payments ?? []).map((payment) => ({
      ...payment,
      profiles: payment.recorded_by ? { full_name: nameByUserId.get(payment.recorded_by) ?? null } : null
    }))
  };
}

export async function getViolationOptions() {
  const context = await getTenantContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("violations")
    .select("id, description, property_id")
    .eq("organization_id", context.organizationId)
    .in("status", ["open", "under_review", "warning_sent", "fine_pending"])
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((violation) => ({
    id: violation.id,
    label: violation.description.slice(0, 60)
  }));
}

export { formatCurrency };
