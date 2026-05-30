import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import type { OrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

export function parseForm<T>(schema: z.ZodType<T>, formData: FormData): T {
  const result = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid form submission");
  }
  return result.data;
}

export async function writeActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  actorId: string,
  action: string,
  targetTable: string,
  targetId?: string
) {
  await supabase.from("activity_logs").insert({
    organization_id: organizationId,
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId ?? null
  });
}

export function getRequiredFile(formData: FormData, name: string) {
  const value = formData.get(name);
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("A file is required.");
  }
  return value;
}

export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
}

export function buildStoragePath(organizationId: string, segments: string[], fileName: string) {
  return `${organizationId}/${segments.join("/")}/${randomUUID()}-${sanitizeFileName(fileName)}`;
}

type MutationResult<T> = { data: T | null; error: { message: string } | null };

export async function finishMutation(
  ctx: OrgContext,
  options: {
    returnTo: string;
    paths: string[];
    successMessage: string;
    action: string;
    targetTable: string;
    targetId?: string;
    result: MutationResult<{ id: string } | null>;
  }
) {
  const { returnTo, paths, successMessage, action, targetTable, targetId, result } = options;
  if (result.error) {
    redirect(`${returnTo}?error=${encodeURIComponent(result.error.message)}`);
  }
  if (targetId ?? result.data?.id) {
    await writeActivity(ctx.supabase, ctx.organizationId, ctx.userId, action, targetTable, targetId ?? result.data?.id);
  }
  for (const path of paths) {
    revalidatePath(path);
  }
  redirect(`${returnTo}?message=${encodeURIComponent(successMessage)}`);
}
