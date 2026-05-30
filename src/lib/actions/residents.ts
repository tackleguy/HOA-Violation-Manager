"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  createResidentSchema,
  deleteResidentSchema,
  linkPropertySchema,
  updateResidentSchema
} from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/residents";
const paths = [returnTo, "/dashboard"];

export async function createResident(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createResidentSchema, formData);
  const result = await ctx.supabase
    .from("residents")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Resident created.",
    action: "resident.created",
    targetTable: "residents",
    result
  });
}

export async function updateResident(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updateResidentSchema, formData);
  const result = await ctx.supabase
    .from("residents")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Resident updated.",
    action: "resident.updated",
    targetTable: "residents",
    targetId: id,
    result
  });
}

export async function deleteResident(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteResidentSchema, formData);
  const result = await ctx.supabase.from("residents").delete().eq("id", id).eq("organization_id", ctx.organizationId).select("id").single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Resident removed.",
    action: "resident.deleted",
    targetTable: "residents",
    targetId: id,
    result
  });
}

export async function linkProperty(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(linkPropertySchema, formData);
  const result = await ctx.supabase
    .from("property_owners")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths: [...paths, "/dashboard/properties"],
    successMessage: "Property linked to resident.",
    action: "property_owner.linked",
    targetTable: "property_owners",
    result
  });
}
