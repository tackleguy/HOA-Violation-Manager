"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { requireManagePermission, requireOrgContext } from "@/lib/auth/context";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateNotificationPrefsSchema,
  updateOrganizationSchema
} from "@/lib/validation/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { finishMutation, parseForm, writeActivity } from "./utils";

const returnTo = "/dashboard/settings";
const paths = [returnTo, "/dashboard"];

export async function updateOrganization(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireManagePermission(ctx, returnTo);
  const payload = parseForm(updateOrganizationSchema, formData);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(`${returnTo}?error=${encodeURIComponent("SUPABASE_SERVICE_ROLE_KEY is required to update organization settings.")}`);
  }

  const admin = createAdminClient();
  const { error } = await admin.from("organizations").update(payload).eq("id", ctx.organizationId);
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);

  await writeActivity(ctx.supabase, ctx.organizationId, ctx.userId, "organization.updated", "organizations", ctx.organizationId);
  for (const path of paths) revalidatePath(path);
  redirect(`${returnTo}?message=${encodeURIComponent("Organization settings saved.")}`);
}

export async function updateNotificationPrefs(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireManagePermission(ctx, returnTo);
  const prefs = parseForm(updateNotificationPrefsSchema, formData);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(`${returnTo}?error=${encodeURIComponent("SUPABASE_SERVICE_ROLE_KEY is required to update notification preferences.")}`);
  }

  const admin = createAdminClient();
  const { data: org, error: readError } = await admin
    .from("organizations")
    .select("branding")
    .eq("id", ctx.organizationId)
    .single();
  if (readError || !org) redirect(`${returnTo}?error=${encodeURIComponent(readError?.message ?? "Organization not found.")}`);

  const existingBranding =
    org.branding && typeof org.branding === "object" && !Array.isArray(org.branding)
      ? (org.branding as Record<string, unknown>)
      : {};
  const branding = { ...existingBranding, notification_prefs: prefs };

  const { error } = await admin.from("organizations").update({ branding: branding as never }).eq("id", ctx.organizationId);
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);

  await writeActivity(ctx.supabase, ctx.organizationId, ctx.userId, "notification_prefs.updated", "organizations", ctx.organizationId);
  for (const path of paths) revalidatePath(path);
  redirect(`${returnTo}?message=${encodeURIComponent("Notification preferences saved.")}`);
}

export async function inviteMember(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireManagePermission(ctx, returnTo);
  const payload = parseForm(inviteMemberSchema, formData);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(`${returnTo}?error=${encodeURIComponent("SUPABASE_SERVICE_ROLE_KEY is required to send invitations.")}`);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(payload.email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/invite`
  });

  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  if (!data.user) redirect(`${returnTo}?error=${encodeURIComponent("Supabase did not return an invited user.")}`);

  await admin.from("profiles").upsert({
    id: data.user.id,
    email: payload.email
  });

  const { error: membershipError } = await admin.from("memberships").upsert({
    organization_id: ctx.organizationId,
    user_id: data.user.id,
    role: payload.role,
    status: "invited",
    invited_by: ctx.userId
  });

  if (membershipError) redirect(`${returnTo}?error=${encodeURIComponent(membershipError.message)}`);
  await writeActivity(ctx.supabase, ctx.organizationId, ctx.userId, "member.invited", "memberships", data.user.id);
  for (const path of paths) revalidatePath(path);
  redirect(`${returnTo}?message=${encodeURIComponent("Invitation sent.")}`);
}

export async function updateMemberRole(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireManagePermission(ctx, returnTo);
  const { membership_id, role, status } = parseForm(updateMemberRoleSchema, formData);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(`${returnTo}?error=${encodeURIComponent("SUPABASE_SERVICE_ROLE_KEY is required to update member roles.")}`);
  }

  const admin = createAdminClient();
  const result = await admin
    .from("memberships")
    .update({ role, ...(status ? { status } : {}) })
    .eq("id", membership_id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();

  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Member role updated.",
    action: "member.role_updated",
    targetTable: "memberships",
    targetId: membership_id,
    result
  });
}
