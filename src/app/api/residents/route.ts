import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const residentSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable()
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("residents")
    .select("id, first_name, last_name, email, phone, notes, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("last_name");

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, residentSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("residents")
    .insert({ ...payload, organization_id: context.organizationId })
    .select("id, first_name, last_name, email, phone, notes, created_at, updated_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.resident.created", "residents", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
