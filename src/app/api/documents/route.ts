import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const documentSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  visibility: z.string().trim().min(1).default("residents")
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("documents")
    .select("id, name, category, visibility, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, documentSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("documents")
    .insert({ ...payload, organization_id: context.organizationId })
    .select("id, name, category, visibility, created_at, updated_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.document.created", "documents", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
