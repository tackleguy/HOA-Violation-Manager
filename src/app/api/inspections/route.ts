import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const inspectionSchema = z.object({
  title: z.string().trim().min(1),
  scheduled_for: z.string().optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable()
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("inspections")
    .select("id, template_id, title, scheduled_for, assigned_to, status, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("scheduled_for", { ascending: true });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, inspectionSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("inspections")
    .insert({ ...payload, organization_id: context.organizationId })
    .select("id, template_id, title, scheduled_for, assigned_to, status, created_at, updated_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.inspection.scheduled", "inspections", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
