"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  addWorkOrderCommentSchema,
  createWorkOrderSchema,
  deleteWorkOrderSchema,
  updateWorkOrderSchema,
  updateWorkOrderStatusSchema
} from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/work-orders";
const paths = [returnTo, "/dashboard"];

export async function createWorkOrder(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createWorkOrderSchema, formData);
  const result = await ctx.supabase
    .from("work_orders")
    .insert({ ...payload, organization_id: ctx.organizationId, created_by: ctx.userId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Work order created.",
    action: "work_order.created",
    targetTable: "work_orders",
    result
  });
}

export async function updateWorkOrder(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updateWorkOrderSchema, formData);
  const result = await ctx.supabase
    .from("work_orders")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Work order updated.",
    action: "work_order.updated",
    targetTable: "work_orders",
    targetId: id,
    result
  });
}

export async function updateWorkOrderStatus(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, status } = parseForm(updateWorkOrderStatusSchema, formData);
  const completed_at = status === "completed" ? new Date().toISOString() : null;
  const result = await ctx.supabase
    .from("work_orders")
    .update({ status, completed_at })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Work order status updated.",
    action: "work_order.status_updated",
    targetTable: "work_orders",
    targetId: id,
    result
  });
}

export async function addWorkOrderComment(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(addWorkOrderCommentSchema, formData);
  const result = await ctx.supabase
    .from("work_order_comments")
    .insert({
      organization_id: ctx.organizationId,
      work_order_id: payload.work_order_id,
      body: payload.body,
      created_by: ctx.userId
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Comment added.",
    action: "work_order_comment.created",
    targetTable: "work_order_comments",
    result
  });
}

export async function deleteWorkOrder(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteWorkOrderSchema, formData);
  const result = await ctx.supabase
    .from("work_orders")
    .delete()
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Work order removed.",
    action: "work_order.deleted",
    targetTable: "work_orders",
    targetId: id,
    result
  });
}
