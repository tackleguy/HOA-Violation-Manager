"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import { createPropertySchema, deletePropertySchema, updatePropertySchema } from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/properties";
const paths = [returnTo, "/dashboard"];

export async function createProperty(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createPropertySchema, formData);
  const result = await ctx.supabase
    .from("properties")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Property created.",
    action: "property.created",
    targetTable: "properties",
    result
  });
}

export async function updateProperty(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updatePropertySchema, formData);
  const result = await ctx.supabase
    .from("properties")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Property updated.",
    action: "property.updated",
    targetTable: "properties",
    targetId: id,
    result
  });
}

export async function deleteProperty(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deletePropertySchema, formData);
  const result = await ctx.supabase.from("properties").delete().eq("id", id).eq("organization_id", ctx.organizationId).select("id").single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Property removed.",
    action: "property.deleted",
    targetTable: "properties",
    targetId: id,
    result
  });
}
