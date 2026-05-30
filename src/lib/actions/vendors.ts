"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import { createVendorSchema, deleteVendorSchema, updateVendorSchema } from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/vendors";
const paths = [returnTo, "/dashboard"];

export async function createVendor(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createVendorSchema, formData);
  const result = await ctx.supabase
    .from("vendors")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Vendor created.",
    action: "vendor.created",
    targetTable: "vendors",
    result
  });
}

export async function updateVendor(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updateVendorSchema, formData);
  const result = await ctx.supabase
    .from("vendors")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Vendor updated.",
    action: "vendor.updated",
    targetTable: "vendors",
    targetId: id,
    result
  });
}

export async function deleteVendor(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteVendorSchema, formData);
  const result = await ctx.supabase.from("vendors").delete().eq("id", id).eq("organization_id", ctx.organizationId).select("id").single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Vendor removed.",
    action: "vendor.deleted",
    targetTable: "vendors",
    targetId: id,
    result
  });
}
