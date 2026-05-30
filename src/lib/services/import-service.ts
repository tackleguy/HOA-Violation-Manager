import { z } from "zod";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type ImportEntity = "residents" | "properties";

export type ImportRowError = {
  row: number;
  field: string;
  message: string;
};

export type ImportValidationResult = {
  entity: ImportEntity;
  valid: boolean;
  rowCount: number;
  validRows: Record<string, string>[];
  errors: ImportRowError[];
};

export type ImportResult = {
  entity: ImportEntity;
  imported: number;
  skipped: number;
  errors: ImportRowError[];
};

const residentImportSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : "")),
  phone: z.string().trim().optional().transform((value) => value ?? ""),
  notes: z.string().trim().optional().transform((value) => value ?? "")
});

const propertyImportSchema = z.object({
  address: z.string().trim().min(1, "Address is required"),
  parcel_number: z.string().trim().optional().transform((value) => value ?? ""),
  section: z.string().trim().optional().transform((value) => value ?? ""),
  status: z.string().trim().min(1, "Status is required").default("clear")
});

const RESIDENT_HEADERS = ["first_name", "last_name", "email", "phone", "notes"] as const;
const PROPERTY_HEADERS = ["address", "parcel_number", "section", "status"] as const;

export function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  if (!lines.length) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);
    const row: Record<string, string> = {};
    headers.forEach((header, columnIndex) => {
      row[header] = (values[columnIndex] ?? "").trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

export function validateResidentsImport(content: string): ImportValidationResult {
  const { headers, rows } = parseCsv(content);
  const errors: ImportRowError[] = [];
  const validRows: Record<string, string>[] = [];

  for (const required of RESIDENT_HEADERS) {
    if (!headers.includes(required)) {
      errors.push({ row: 0, field: required, message: `Missing required column: ${required}` });
    }
  }
  if (errors.length) {
    return { entity: "residents", valid: false, rowCount: rows.length, validRows: [], errors };
  }

  rows.forEach((row, index) => {
    const result = residentImportSchema.safeParse(row);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: index + 2,
          field: String(issue.path[0] ?? "row"),
          message: issue.message
        });
      }
      return;
    }
    validRows.push(result.data);
  });

  return {
    entity: "residents",
    valid: errors.length === 0,
    rowCount: rows.length,
    validRows,
    errors
  };
}

export function validatePropertiesImport(content: string): ImportValidationResult {
  const { headers, rows } = parseCsv(content);
  const errors: ImportRowError[] = [];
  const validRows: Record<string, string>[] = [];

  for (const required of ["address", "status"] as const) {
    if (!headers.includes(required)) {
      errors.push({ row: 0, field: required, message: `Missing required column: ${required}` });
    }
  }
  if (errors.length) {
    return { entity: "properties", valid: false, rowCount: rows.length, validRows: [], errors };
  }

  rows.forEach((row, index) => {
    const result = propertyImportSchema.safeParse({
      address: row.address,
      parcel_number: row.parcel_number,
      section: row.section,
      status: row.status || "clear"
    });
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          row: index + 2,
          field: String(issue.path[0] ?? "row"),
          message: issue.message
        });
      }
      return;
    }
    validRows.push(result.data);
  });

  return {
    entity: "properties",
    valid: errors.length === 0,
    rowCount: rows.length,
    validRows,
    errors
  };
}

export function validateImport(entity: ImportEntity, content: string): ImportValidationResult {
  if (entity === "residents") return validateResidentsImport(content);
  return validatePropertiesImport(content);
}

export async function importResidents(rows: Record<string, string>[]): Promise<ImportResult> {
  const context = await getTenantContext();
  if (!context) {
    return { entity: "residents", imported: rows.length, skipped: 0, errors: [] };
  }

  const errors: ImportRowError[] = [];
  let imported = 0;
  let skipped = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const parsed = residentImportSchema.safeParse(rows[index]);
    if (!parsed.success) {
      skipped += 1;
      errors.push({ row: index + 2, field: "row", message: parsed.error.issues[0]?.message ?? "Invalid row" });
      continue;
    }

    const payload = parsed.data;
    const duplicateQuery = context.supabase
      .from("residents")
      .select("id")
      .eq("organization_id", context.organizationId)
      .eq("first_name", payload.first_name)
      .eq("last_name", payload.last_name);

    if (payload.email) {
      duplicateQuery.eq("email", payload.email);
    }

    const { data: existing } = await duplicateQuery.maybeSingle();
    if (existing) {
      skipped += 1;
      errors.push({ row: index + 2, field: "email", message: "Duplicate resident skipped" });
      continue;
    }

    const { error } = await context.supabase.from("residents").insert({
      organization_id: context.organizationId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email || null,
      phone: payload.phone || null,
      notes: payload.notes || null
    });

    if (error) {
      skipped += 1;
      errors.push({ row: index + 2, field: "row", message: error.message });
      continue;
    }

    imported += 1;
  }

  return { entity: "residents", imported, skipped, errors };
}

export async function importProperties(rows: Record<string, string>[]): Promise<ImportResult> {
  const context = await getTenantContext();
  if (!context) {
    return { entity: "properties", imported: rows.length, skipped: 0, errors: [] };
  }

  const errors: ImportRowError[] = [];
  let imported = 0;
  let skipped = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const parsed = propertyImportSchema.safeParse({
      address: rows[index].address,
      parcel_number: rows[index].parcel_number,
      section: rows[index].section,
      status: rows[index].status || "clear"
    });
    if (!parsed.success) {
      skipped += 1;
      errors.push({ row: index + 2, field: "row", message: parsed.error.issues[0]?.message ?? "Invalid row" });
      continue;
    }

    const payload = parsed.data;
    const { data: existing } = await context.supabase
      .from("properties")
      .select("id")
      .eq("organization_id", context.organizationId)
      .eq("address", payload.address)
      .maybeSingle();

    if (existing) {
      skipped += 1;
      errors.push({ row: index + 2, field: "address", message: "Duplicate property skipped" });
      continue;
    }

    const { error } = await context.supabase.from("properties").insert({
      organization_id: context.organizationId,
      address: payload.address,
      parcel_number: payload.parcel_number || null,
      section: payload.section || null,
      status: payload.status
    });

    if (error) {
      skipped += 1;
      errors.push({ row: index + 2, field: "row", message: error.message });
      continue;
    }

    imported += 1;
  }

  return { entity: "properties", imported, skipped, errors };
}

export async function runImport(entity: ImportEntity, content: string): Promise<ImportResult> {
  const validation = validateImport(entity, content);
  if (!validation.validRows.length) {
    return { entity, imported: 0, skipped: validation.rowCount, errors: validation.errors };
  }
  if (entity === "residents") return importResidents(validation.validRows);
  return importProperties(validation.validRows);
}

export function getImportTemplate(entity: ImportEntity): string {
  if (entity === "residents") {
    return buildTemplateCsv([...RESIDENT_HEADERS], [
      { first_name: "Jane", last_name: "Resident", email: "jane@example.com", phone: "555-0100", notes: "Optional notes" }
    ]);
  }
  return buildTemplateCsv([...PROPERTY_HEADERS], [
    { address: "123 Main St", parcel_number: "P-123", section: "North", status: "clear" }
  ]);
}

function buildTemplateCsv(headers: string[], rows: Record<string, string>[]) {
  const escape = (value: string) => (value.includes(",") ? `"${value}"` : value);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escape(row[header] ?? "")).join(","));
  }
  return lines.join("\n");
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

async function getTenantContext() {
  if (!hasSupabasePublicEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;
  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) return null;
  return { supabase, organizationId };
}
