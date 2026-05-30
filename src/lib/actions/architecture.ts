"use server";

import { redirect } from "next/navigation";
import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  architecturalFileSchema,
  createArchitecturalRequestSchema,
  updateArchitecturalStatusSchema
} from "@/lib/validation/schemas";
import { buildStoragePath, finishMutation, getRequiredFile, parseForm } from "./utils";

const returnTo = "/dashboard/architecture";
const paths = [returnTo, "/dashboard"];

export async function createArchitecturalRequest(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createArchitecturalRequestSchema, formData);
  const result = await ctx.supabase
    .from("architectural_requests")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Architectural request created.",
    action: "architectural_request.created",
    targetTable: "architectural_requests",
    result
  });
}

export async function updateArchitecturalStatus(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, status, decision_notes } = parseForm(updateArchitecturalStatusSchema, formData);
  const decided_at = status === "approved" || status === "rejected" ? new Date().toISOString() : null;
  const result = await ctx.supabase
    .from("architectural_requests")
    .update({ status, decision_notes, decided_at })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Request status updated.",
    action: "architectural_request.status_updated",
    targetTable: "architectural_requests",
    targetId: id,
    result
  });
}

export async function uploadArchitecturalFile(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(architecturalFileSchema, formData);
  const file = getRequiredFile(formData, "file");
  const path = buildStoragePath(ctx.organizationId, ["architectural", payload.request_id], file.name);

  const { error: uploadError } = await ctx.supabase.storage.from("hoa-documents").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (uploadError) redirect(`${returnTo}?error=${encodeURIComponent(uploadError.message)}`);

  const result = await ctx.supabase
    .from("architectural_request_files")
    .insert({
      organization_id: ctx.organizationId,
      request_id: payload.request_id,
      storage_path: path,
      file_name: file.name
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Supporting file uploaded.",
    action: "architectural_request_file.uploaded",
    targetTable: "architectural_request_files",
    result
  });
}

export const updateStatus = updateArchitecturalStatus;
export const uploadFile = uploadArchitecturalFile;
