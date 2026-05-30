import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const announcementSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  audience: z.string().trim().min(1).default("all"),
  publish: z.boolean().optional().default(false)
});

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("announcements")
    .select("id, title, body, audience, published_at, created_by, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, announcementSchema);
  if (response) return response;

  const { publish, ...announcement } = payload;
  const { data, error } = await context.supabase
    .from("announcements")
    .insert({
      ...announcement,
      organization_id: context.organizationId,
      created_by: context.userId,
      published_at: publish ? new Date().toISOString() : null
    })
    .select("id, title, body, audience, published_at, created_by, created_at")
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, publish ? "api.announcement.published" : "api.announcement.created", "announcements", data.id);
  return NextResponse.json({ data }, { status: 201 });
}
