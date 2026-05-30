"use server";

import { redirect } from "next/navigation";
import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  completeInspectionSchema,
  createInspectionReportSchema,
  createInspectionSchema,
  inspectionReportPhotoSchema,
  updateInspectionSchema
} from "@/lib/validation/schemas";
import { buildStoragePath, finishMutation, getRequiredFile, parseForm } from "./utils";

const returnTo = "/dashboard/inspections";
const paths = [returnTo, "/dashboard"];

export async function createInspection(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createInspectionSchema, formData);
  const result = await ctx.supabase
    .from("inspections")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Inspection scheduled.",
    action: "inspection.scheduled",
    targetTable: "inspections",
    result
  });
}

export async function updateInspection(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, status, ...payload } = parseForm(updateInspectionSchema, formData);
  const result = await ctx.supabase
    .from("inspections")
    .update({ ...payload, ...(status ? { status } : {}) })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Inspection updated.",
    action: "inspection.updated",
    targetTable: "inspections",
    targetId: id,
    result
  });
}

export async function completeInspection(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(completeInspectionSchema, formData);
  const result = await ctx.supabase
    .from("inspections")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Inspection marked complete.",
    action: "inspection.completed",
    targetTable: "inspections",
    targetId: id,
    result
  });
}

export async function createInspectionReport(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createInspectionReportSchema, formData);
  const result = await ctx.supabase
    .from("inspection_reports")
    .insert({
      organization_id: ctx.organizationId,
      inspection_id: payload.inspection_id,
      findings: payload.findings,
      notes: payload.notes,
      recommendations: payload.recommendations
    })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Inspection report created.",
    action: "inspection_report.created",
    targetTable: "inspection_reports",
    result
  });
}

export async function uploadInspectionReportPhoto(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(inspectionReportPhotoSchema, formData);
  const file = getRequiredFile(formData, "file");

  const { data: report, error: reportError } = await ctx.supabase
    .from("inspection_reports")
    .select("id, inspection_id, findings")
    .eq("id", payload.report_id)
    .eq("organization_id", ctx.organizationId)
    .single();
  if (reportError || !report) {
    redirect(`${returnTo}?error=${encodeURIComponent(reportError?.message ?? "Inspection report not found.")}`);
  }

  const path = buildStoragePath(ctx.organizationId, ["inspections", report.inspection_id, "reports", report.id], file.name);
  const { error: uploadError } = await ctx.supabase.storage.from("hoa-documents").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (uploadError) redirect(`${returnTo}?error=${encodeURIComponent(uploadError.message)}`);

  const findings = Array.isArray(report.findings) ? [...report.findings] : [];
  findings.push({
    type: "photo",
    storage_path: path,
    caption: payload.caption,
    file_name: file.name,
    uploaded_at: new Date().toISOString()
  });

  const result = await ctx.supabase
    .from("inspection_reports")
    .update({ findings })
    .eq("id", report.id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Report photo uploaded.",
    action: "inspection_report_photo.uploaded",
    targetTable: "inspection_reports",
    targetId: report.id,
    result
  });
}

export const scheduleInspection = createInspection;
export const uploadReportPhoto = uploadInspectionReportPhoto;
