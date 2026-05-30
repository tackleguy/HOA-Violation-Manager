import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const propertySchema = z.object({
  address: z.string().trim().min(1),
  parcel_number: z.string().trim().optional().nullable(),
  section: z.string().trim().optional().nullable(),
  status: z.string().trim().min(1).default("clear"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable()
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("properties")
    .select("id, address, parcel_number, section, status, latitude, longitude, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("address");

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, propertySchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("properties")
    .insert({ ...payload, organization_id: context.organizationId })
    .select("id, address, parcel_number, section, status, latitude, longitude, created_at, updated_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.property.created", "properties", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
