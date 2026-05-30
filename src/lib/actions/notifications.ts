"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/context";
import { markNotificationReadSchema } from "@/lib/validation/schemas";
import { parseForm } from "./utils";

const returnTo = "/dashboard";

export async function markNotificationRead(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  const { id } = parseForm(markNotificationReadSchema, formData);
  const { error } = await ctx.supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", ctx.userId)
    .eq("organization_id", ctx.organizationId);
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(returnTo);
  revalidatePath("/dashboard/settings");
}

export async function markAllNotificationsRead(formData?: FormData) {
  void formData;
  const ctx = await requireOrgContext(returnTo);
  const { error } = await ctx.supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", ctx.userId)
    .eq("organization_id", ctx.organizationId)
    .is("read_at", null);
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(returnTo);
  revalidatePath("/dashboard/settings");
}

export const markRead = markNotificationRead;
export const markAllRead = markAllNotificationsRead;
