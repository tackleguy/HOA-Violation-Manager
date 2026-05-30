"use server";

import { redirect } from "next/navigation";
import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  createDocumentSchema,
  deleteDocumentSchema,
  documentVersionSchema,
  updateDocumentSchema
} from "@/lib/validation/schemas";
import { buildStoragePath, finishMutation, getRequiredFile, parseForm } from "./utils";

const returnTo = "/dashboard/documents";
const paths = [returnTo, "/dashboard"];

export async function createDocument(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createDocumentSchema, formData);
  const result = await ctx.supabase
    .from("documents")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Document record created.",
    action: "document.created",
    targetTable: "documents",
    result
  });
}

export async function updateDocument(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updateDocumentSchema, formData);
  const result = await ctx.supabase
    .from("documents")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Document updated.",
    action: "document.updated",
    targetTable: "documents",
    targetId: id,
    result
  });
}

export async function uploadDocumentVersion(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(documentVersionSchema, formData);
  const file = getRequiredFile(formData, "file");
  const path = buildStoragePath(ctx.organizationId, ["documents", payload.document_id], file.name);

  const { error: uploadError } = await ctx.supabase.storage.from("hoa-documents").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (uploadError) redirect(`${returnTo}?error=${encodeURIComponent(uploadError.message)}`);

  const result = await ctx.supabase
    .from("document_versions")
    .insert({
      organization_id: ctx.organizationId,
      document_id: payload.document_id,
      version_label: payload.version_label,
      storage_path: path,
      uploaded_by: ctx.userId
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Document version uploaded.",
    action: "document_version.uploaded",
    targetTable: "document_versions",
    result
  });
}

export async function deleteDocument(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteDocumentSchema, formData);
  const result = await ctx.supabase.from("documents").delete().eq("id", id).eq("organization_id", ctx.organizationId).select("id").single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Document removed.",
    action: "document.deleted",
    targetTable: "documents",
    targetId: id,
    result
  });
}
