"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import { exportEntity, type ExportEntity } from "@/lib/services/export-service";
import { getImportTemplate, runImport, validateImport, type ImportEntity } from "@/lib/services/import-service";

const exportPaths = ["/dashboard/reports", "/dashboard/residents", "/dashboard/properties", "/dashboard"];
const importReturnTo = "/dashboard/settings";

export async function exportEntityCsv(entity: ExportEntity) {
  await requireOrgContext("/dashboard/reports");
  const csv = await exportEntity(entity);
  for (const path of exportPaths) {
    revalidatePath(path);
  }
  return csv;
}

export async function importCsvEntity(formData: FormData) {
  const ctx = await requireOrgContext(importReturnTo);
  requireWritePermission(ctx, importReturnTo);

  const entity = formData.get("entity");
  const file = formData.get("file");

  if (entity !== "residents" && entity !== "properties") {
    redirect(`${importReturnTo}?error=${encodeURIComponent("Unsupported import entity.")}`);
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${importReturnTo}?error=${encodeURIComponent("A CSV file is required.")}`);
  }

  const content = await file.text();
  const validation = validateImport(entity, content);

  if (!validation.valid) {
    const message = validation.errors[0]?.message ?? "Import validation failed.";
    redirect(`${importReturnTo}?error=${encodeURIComponent(message)}`);
  }

  const result = await runImport(entity as ImportEntity, content);
  revalidatePath("/dashboard/residents");
  revalidatePath("/dashboard/properties");
  revalidatePath(importReturnTo);

  const summary = `Imported ${result.imported} ${entity}. Skipped ${result.skipped}.`;
  redirect(`${importReturnTo}?message=${encodeURIComponent(summary)}`);
}

export async function downloadImportTemplate(entity: ImportEntity) {
  await requireOrgContext(importReturnTo);
  return getImportTemplate(entity);
}

export async function previewImport(formData: FormData) {
  await requireOrgContext(importReturnTo);
  const entity = formData.get("entity");
  const file = formData.get("file");

  if (entity !== "residents" && entity !== "properties") {
    return { valid: false, errors: [{ row: 0, field: "entity", message: "Unsupported import entity." }] };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { valid: false, errors: [{ row: 0, field: "file", message: "A CSV file is required." }] };
  }

  const content = await file.text();
  return validateImport(entity, content);
}
