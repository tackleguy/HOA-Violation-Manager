"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  createFineSchema,
  deleteFineSchema,
  recordFinePaymentSchema,
  updateFineSchema,
  updateFineStatusSchema
} from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/fines";
const paths = [returnTo, "/dashboard"];

export async function createFine(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { amount, ...payload } = parseForm(createFineSchema, formData);
  const result = await ctx.supabase
    .from("fines")
    .insert({
      ...payload,
      amount_cents: Math.round(amount * 100),
      organization_id: ctx.organizationId,
      created_by: ctx.userId
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Fine issued.",
    action: "fine.created",
    targetTable: "fines",
    result
  });
}

export async function updateFine(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, amount, ...payload } = parseForm(updateFineSchema, formData);
  const result = await ctx.supabase
    .from("fines")
    .update({ ...payload, amount_cents: Math.round(amount * 100) })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Fine updated.",
    action: "fine.updated",
    targetTable: "fines",
    targetId: id,
    result
  });
}

export async function updateFineStatus(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, status } = parseForm(updateFineStatusSchema, formData);
  const paid_at = status === "paid" ? new Date().toISOString() : null;
  const result = await ctx.supabase
    .from("fines")
    .update({ status, paid_at })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Fine status updated.",
    action: "fine.status_updated",
    targetTable: "fines",
    targetId: id,
    result
  });
}

export async function recordFinePayment(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { amount, ...payload } = parseForm(recordFinePaymentSchema, formData);
  const paymentResult = await ctx.supabase
    .from("fine_payments")
    .insert({
      ...payload,
      amount_cents: Math.round(amount * 100),
      organization_id: ctx.organizationId,
      recorded_by: ctx.userId
    })
    .select("id, fine_id")
    .single();

  if (!paymentResult.error && paymentResult.data) {
    const { data: payments } = await ctx.supabase
      .from("fine_payments")
      .select("amount_cents")
      .eq("fine_id", payload.fine_id)
      .eq("organization_id", ctx.organizationId);

    const { data: fine } = await ctx.supabase
      .from("fines")
      .select("amount_cents")
      .eq("id", payload.fine_id)
      .eq("organization_id", ctx.organizationId)
      .single();

    const totalPaid = (payments ?? []).reduce((sum, payment) => sum + payment.amount_cents, 0);
    if (fine && totalPaid >= fine.amount_cents) {
      await ctx.supabase
        .from("fines")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payload.fine_id)
        .eq("organization_id", ctx.organizationId);
    }
  }

  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Payment recorded.",
    action: "fine_payment.recorded",
    targetTable: "fine_payments",
    result: paymentResult
  });
}

export async function deleteFine(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteFineSchema, formData);
  const result = await ctx.supabase.from("fines").delete().eq("id", id).eq("organization_id", ctx.organizationId).select("id").single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Fine removed.",
    action: "fine.deleted",
    targetTable: "fines",
    targetId: id,
    result
  });
}
