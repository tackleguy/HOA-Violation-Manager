import { NextResponse } from "next/server";
import { apiError, requireTenantApiContext } from "@/lib/api/tenant-api";

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("activity_logs")
    .select("id, actor_id, action, target_table, target_id, metadata, created_at")
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}
