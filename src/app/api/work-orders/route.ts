import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const workOrderSchema = z.object({
  property_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1).default("maintenance"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigned_to: z.string().uuid().optional().nullable(),
  vendor_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable()
});

const workOrderUpdateSchema = workOrderSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(["open", "assigned", "in_progress", "completed", "canceled"]).optional()
});

const workOrderDeleteSchema = z.object({ id: z.string().uuid() });

const workOrderSelect =
  "id, property_id, title, description, category, priority, status, assigned_to, vendor_id, due_date, completed_at, created_by";

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("work_orders")
    .select(workOrderSelect)
    .eq("organization_id", context.organizationId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, workOrderSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("work_orders")
    .insert({ ...payload, organization_id: context.organizationId, created_by: context.userId })
    .select(workOrderSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.work_order.created", "work_orders", data.id);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, workOrderUpdateSchema);
  if (response) return response;

  const { id, status, ...updates } = payload;
  const completed_at = status === "completed" ? new Date().toISOString() : undefined;

  const { data, error } = await context.supabase
    .from("work_orders")
    .update({ ...updates, ...(status ? { status, ...(completed_at ? { completed_at } : {}) } : {}) })
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select(workOrderSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.work_order.updated", "work_orders", data.id);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, workOrderDeleteSchema);
  if (response) return response;

  const { error } = await context.supabase
    .from("work_orders")
    .delete()
    .eq("id", payload.id)
    .eq("organization_id", context.organizationId);
  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.work_order.deleted", "work_orders", payload.id);
  return NextResponse.json({ success: true });
}
