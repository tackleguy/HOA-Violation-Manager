"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import {
  buildReportExportData,
  getComplianceReport,
  getFinancialSummary,
  getOccupancyStats,
  getReportsDashboard,
  getViolationSummary
} from "@/lib/services/reports-service";

const returnTo = "/dashboard/reports";
const paths = [returnTo, "/dashboard"];

export async function fetchReportsDashboard() {
  await requireOrgContext(returnTo);
  return getReportsDashboard();
}

export async function fetchComplianceReport() {
  await requireOrgContext(returnTo);
  return getComplianceReport();
}

export async function fetchViolationSummary() {
  await requireOrgContext(returnTo);
  return getViolationSummary();
}

export async function fetchFinancialSummary() {
  await requireOrgContext(returnTo);
  return getFinancialSummary();
}

export async function fetchOccupancyStats() {
  await requireOrgContext(returnTo);
  return getOccupancyStats();
}

export async function generateReportExport(
  reportType: "compliance" | "violations" | "financial" | "occupancy"
) {
  await requireOrgContext(returnTo);
  const dataset = await buildReportExportData(reportType);
  revalidatePath(returnTo);
  for (const path of paths) {
    revalidatePath(path);
  }
  return dataset;
}
