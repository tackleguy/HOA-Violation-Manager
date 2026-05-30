import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const vendorSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active")
});

const vendorUpdateSchema = vendorSchema.partial().extend({ id: z.string().uuid() });
const vendorDeleteSchema = z.object({ id: z.string().uuid() });

const vendorSelect = "id, name, category, email, phone, notes, status";

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("vendors")
    .select(vendorSelect)
    .eq("organization_id", context.organizationId)
    .order("name");

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, vendorSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("vendors")
    .insert({ ...payload, organization_id: context.organizationId })
    .select(vendorSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.vendor.created", "vendors", data.id);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, vendorUpdateSchema);
  if (response) return response;

  const { id, ...updates } = payload;

  const { data, error } = await context.supabase
    .from("vendors")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select(vendorSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.vendor.updated", "vendors", data.id);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, vendorDeleteSchema);
  if (response) return response;

  const { error } = await context.supabase.from("vendors").delete().eq("id", payload.id).eq("organization_id", context.organizationId);
  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.vendor.deleted", "vendors", payload.id);
  return NextResponse.json({ success: true });
}
