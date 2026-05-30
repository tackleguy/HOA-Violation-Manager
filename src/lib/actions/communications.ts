"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import { createAnnouncementSchema, publishAnnouncementSchema } from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/communications";
const paths = [returnTo, "/dashboard"];

export async function createAnnouncement(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createAnnouncementSchema, formData);
  const result = await ctx.supabase
    .from("announcements")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Announcement created.",
    action: "announcement.created",
    targetTable: "announcements",
    result
  });
}

export async function publishAnnouncement(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(publishAnnouncementSchema, formData);
  const result = await ctx.supabase
    .from("announcements")
    .update({ published_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Announcement published.",
    action: "announcement.published",
    targetTable: "announcements",
    targetId: id,
    result
  });
}
