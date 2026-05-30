import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const violationSchema = z.object({
  property_id: z.string().uuid(),
  resident_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  description: z.string().trim().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  due_date: z.string().optional().nullable()
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("violations")
    .select("id, property_id, resident_id, category_id, description, status, severity, due_date, resolved_at, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, violationSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("violations")
    .insert({ ...payload, organization_id: context.organizationId, created_by: context.userId })
    .select("id, property_id, resident_id, category_id, description, status, severity, due_date, resolved_at, created_at, updated_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.violation.created", "violations", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
