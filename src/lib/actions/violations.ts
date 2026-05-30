"use server";

import { redirect } from "next/navigation";
import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  addViolationCommentSchema,
  createViolationSchema,
  deleteViolationSchema,
  updateViolationSchema,
  updateViolationStatusSchema,
  violationPhotoSchema
} from "@/lib/validation/schemas";
import { buildStoragePath, finishMutation, getRequiredFile, parseForm } from "./utils";

const returnTo = "/dashboard/violations";
const paths = [returnTo, "/dashboard"];

export async function createViolation(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createViolationSchema, formData);
  const result = await ctx.supabase
    .from("violations")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Violation created.",
    action: "violation.created",
    targetTable: "violations",
    result
  });
}

export async function updateViolation(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updateViolationSchema, formData);
  const result = await ctx.supabase
    .from("violations")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Violation updated.",
    action: "violation.updated",
    targetTable: "violations",
    targetId: id,
    result
  });
}

export async function updateViolationStatus(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, status } = parseForm(updateViolationStatusSchema, formData);
  const resolved_at = status === "resolved" || status === "closed" ? new Date().toISOString() : null;
  const result = await ctx.supabase
    .from("violations")
    .update({ status, resolved_at })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Violation status updated.",
    action: "violation.status_updated",
    targetTable: "violations",
    targetId: id,
    result
  });
}

export async function addViolationComment(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(addViolationCommentSchema, formData);
  const result = await ctx.supabase
    .from("violation_comments")
    .insert({
      organization_id: ctx.organizationId,
      violation_id: payload.violation_id,
      body: payload.body,
      created_by: ctx.userId
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Comment added.",
    action: "violation_comment.created",
    targetTable: "violation_comments",
    result
  });
}

export async function uploadViolationPhoto(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(violationPhotoSchema, formData);
  const file = getRequiredFile(formData, "file");
  const path = buildStoragePath(ctx.organizationId, ["violations", payload.violation_id], file.name);

  const { error: uploadError } = await ctx.supabase.storage.from("violation-evidence").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (uploadError) redirect(`${returnTo}?error=${encodeURIComponent(uploadError.message)}`);

  const result = await ctx.supabase
    .from("violation_photos")
    .insert({
      organization_id: ctx.organizationId,
      violation_id: payload.violation_id,
      storage_path: path,
      caption: payload.caption,
      created_by: ctx.userId
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Violation evidence uploaded.",
    action: "violation_photo.uploaded",
    targetTable: "violation_photos",
    result
  });
}

export async function deleteViolation(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteViolationSchema, formData);
  const result = await ctx.supabase.from("violations").delete().eq("id", id).eq("organization_id", ctx.organizationId).select("id").single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Violation removed.",
    action: "violation.deleted",
    targetTable: "violations",
    targetId: id,
    result
  });
}
