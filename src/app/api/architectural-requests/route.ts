import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const requestSchema = z.object({
  property_id: z.string().uuid(),
  resident_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().nullable()
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("architectural_requests")
    .select("id, property_id, resident_id, title, description, status, decision_notes, decided_at, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, requestSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("architectural_requests")
    .insert({ ...payload, organization_id: context.organizationId })
    .select("id, property_id, resident_id, title, description, status, decision_notes, decided_at, created_at, updated_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.architectural_request.created", "architectural_requests", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
