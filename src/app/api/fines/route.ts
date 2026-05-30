import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const fineSchema = z.object({
  violation_id: z.string().uuid().optional().nullable(),
  property_id: z.string().uuid(),
  resident_id: z.string().uuid().optional().nullable(),
  amount_cents: z.number().int().positive(),
  description: z.string().trim().min(1),
  due_date: z.string().optional().nullable()
});

const fineUpdateSchema = fineSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(["issued", "paid", "waived", "overdue"]).optional()
});

const fineDeleteSchema = z.object({ id: z.string().uuid() });

const fineSelect =
  "id, violation_id, property_id, resident_id, amount_cents, description, status, due_date, issued_at, paid_at, created_by";

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("fines")
    .select(fineSelect)
    .eq("organization_id", context.organizationId)
    .order("issued_at", { ascending: false });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, fineSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("fines")
    .insert({ ...payload, organization_id: context.organizationId, created_by: context.userId })
    .select(fineSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.fine.created", "fines", data.id);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, fineUpdateSchema);
  if (response) return response;

  const { id, status, ...updates } = payload;
  const paid_at = status === "paid" ? new Date().toISOString() : undefined;

  const { data, error } = await context.supabase
    .from("fines")
    .update({ ...updates, ...(status ? { status, ...(paid_at ? { paid_at } : {}) } : {}) })
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select(fineSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.fine.updated", "fines", data.id);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, fineDeleteSchema);
  if (response) return response;

  const { error } = await context.supabase.from("fines").delete().eq("id", payload.id).eq("organization_id", context.organizationId);
  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.fine.deleted", "fines", payload.id);
  return NextResponse.json({ success: true });
}
