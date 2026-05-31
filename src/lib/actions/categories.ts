"use server";

import { requireManagePermission, requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import { createCategorySchema, deleteCategorySchema } from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/settings";
const paths = [returnTo, "/dashboard/violations"];

export async function createCategory(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createCategorySchema, formData);
  const result = await ctx.supabase
    .from("violation_categories")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Category created.",
    action: "violation_category.created",
    targetTable: "violation_categories",
    result
  });
}

export async function deleteCategory(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireManagePermission(ctx, returnTo);
  const { id } = parseForm(deleteCategorySchema, formData);
  const result = await ctx.supabase
    .from("violation_categories")
    .delete()
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Category removed.",
    action: "violation_category.deleted",
    targetTable: "violation_categories",
    targetId: id,
    result
  });
}
