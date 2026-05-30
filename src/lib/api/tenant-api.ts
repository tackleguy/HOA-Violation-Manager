import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type TenantContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  organizationId: string;
};

export async function requireTenantApiContext(): Promise<TenantContext | NextResponse> {
  if (!hasSupabasePublicEnv()) {
    return apiError("Supabase environment variables are not configured.", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return apiError("Authentication required.", 401);
  }

  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) {
    return apiError("No active HOA workspace is assigned to this account.", 403);
  }

  return { supabase, userId: user.id, organizationId };
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJson<T>(request: Request, schema: z.ZodType<T>) {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null,
      response: apiError(result.error.issues[0]?.message ?? "Invalid request body.", 422)
    };
  }

  return { data: result.data, response: null };
}

export async function writeApiActivity(
  context: TenantContext,
  action: string,
  targetTable: string,
  targetId?: string
) {
  await context.supabase.from("activity_logs").insert({
    organization_id: context.organizationId,
    actor_id: context.userId,
    action,
    target_table: targetTable,
    target_id: targetId ?? null
  });
}
