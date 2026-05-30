"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env, hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const uuidField = z.string().uuid();
const optionalText = z.string().trim().optional().transform((value) => (value ? value : null));

const residentSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")).transform((value) => (value ? value : null)),
  phone: optionalText,
  notes: optionalText
});

const propertySchema = z.object({
  address: z.string().trim().min(1),
  parcel_number: optionalText,
  section: optionalText,
  status: z.string().trim().min(1).default("clear")
});

const violationSchema = z.object({
  property_id: uuidField,
  resident_id: z.string().uuid().optional().or(z.literal("")).transform((value) => (value ? value : null)),
  category_id: z.string().uuid().optional().or(z.literal("")).transform((value) => (value ? value : null)),
  description: z.string().trim().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  due_date: z.string().optional().or(z.literal("")).transform((value) => (value ? value : null))
});

const architecturalRequestSchema = z.object({
  property_id: uuidField,
  resident_id: z.string().uuid().optional().or(z.literal("")).transform((value) => (value ? value : null)),
  title: z.string().trim().min(1),
  description: optionalText
});

const inspectionSchema = z.object({
  title: z.string().trim().min(1),
  scheduled_for: z.string().optional().or(z.literal("")).transform((value) => (value ? value : null))
});

const documentSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().trim().min(1),
  visibility: z.string().trim().min(1).default("residents")
});

const announcementSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  audience: z.string().trim().min(1).default("all")
});

const inviteSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["super_admin", "hoa_admin", "board_member", "community_manager", "inspector", "read_only"]).default("read_only")
});

const documentVersionSchema = z.object({
  document_id: uuidField,
  version_label: z.string().trim().min(1)
});

const violationPhotoSchema = z.object({
  violation_id: uuidField,
  caption: optionalText
});

async function requireOrgContext(returnTo: string) {
  if (!hasSupabasePublicEnv()) {
    redirect(`${returnTo}?error=${encodeURIComponent("Supabase environment variables are required before saving records.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) {
    redirect(`${returnTo}?error=${encodeURIComponent("Your account is not assigned to an active HOA workspace.")}`);
  }

  return { supabase, userId: user.id, organizationId };
}

function parseForm<T>(schema: z.ZodType<T>, formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid form submission");
  }
  return result.data;
}

async function writeActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  actorId: string,
  action: string,
  targetTable: string,
  targetId?: string
) {
  await supabase.from("activity_logs").insert({
    organization_id: organizationId,
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId ?? null
  });
}

export async function createResident(formData: FormData) {
  const returnTo = "/dashboard/residents";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(residentSchema, formData);
  const { data, error } = await supabase.from("residents").insert({ ...payload, organization_id: organizationId }).select("id").single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "resident.created", "residents", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Resident created.")}`);
}

export async function createProperty(formData: FormData) {
  const returnTo = "/dashboard/properties";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(propertySchema, formData);
  const { data, error } = await supabase.from("properties").insert({ ...payload, organization_id: organizationId }).select("id").single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "property.created", "properties", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Property created.")}`);
}

export async function createViolation(formData: FormData) {
  const returnTo = "/dashboard/violations";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(violationSchema, formData);
  const { data, error } = await supabase
    .from("violations")
    .insert({ ...payload, organization_id: organizationId, created_by: userId })
    .select("id")
    .single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "violation.created", "violations", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Violation created.")}`);
}

export async function createArchitecturalRequest(formData: FormData) {
  const returnTo = "/dashboard/architecture";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(architecturalRequestSchema, formData);
  const { data, error } = await supabase
    .from("architectural_requests")
    .insert({ ...payload, organization_id: organizationId })
    .select("id")
    .single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "architectural_request.created", "architectural_requests", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Architectural request created.")}`);
}

export async function scheduleInspection(formData: FormData) {
  const returnTo = "/dashboard/inspections";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(inspectionSchema, formData);
  const { data, error } = await supabase.from("inspections").insert({ ...payload, organization_id: organizationId }).select("id").single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "inspection.scheduled", "inspections", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Inspection scheduled.")}`);
}

export async function createDocument(formData: FormData) {
  const returnTo = "/dashboard/documents";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(documentSchema, formData);
  const { data, error } = await supabase.from("documents").insert({ ...payload, organization_id: organizationId }).select("id").single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "document.created", "documents", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Document record created.")}`);
}

export async function uploadDocumentVersion(formData: FormData) {
  const returnTo = "/dashboard/documents";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(documentVersionSchema, formData);
  const file = getRequiredFile(formData, "file");
  const path = `${organizationId}/documents/${payload.document_id}/${randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("hoa-documents").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (uploadError) redirect(`${returnTo}?error=${encodeURIComponent(uploadError.message)}`);

  const { data, error } = await supabase
    .from("document_versions")
    .insert({
      organization_id: organizationId,
      document_id: payload.document_id,
      version_label: payload.version_label,
      storage_path: path,
      uploaded_by: userId
    })
    .select("id")
    .single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);

  await writeActivity(supabase, organizationId, userId, "document_version.uploaded", "document_versions", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Document version uploaded.")}`);
}

export async function createAnnouncement(formData: FormData) {
  const returnTo = "/dashboard/communications";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(announcementSchema, formData);
  const { data, error } = await supabase
    .from("announcements")
    .insert({ ...payload, organization_id: organizationId, created_by: userId })
    .select("id")
    .single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  await writeActivity(supabase, organizationId, userId, "announcement.created", "announcements", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Announcement created.")}`);
}

export async function uploadViolationPhoto(formData: FormData) {
  const returnTo = "/dashboard/violations";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(violationPhotoSchema, formData);
  const file = getRequiredFile(formData, "file");
  const path = `${organizationId}/violations/${payload.violation_id}/${randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage.from("violation-evidence").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (uploadError) redirect(`${returnTo}?error=${encodeURIComponent(uploadError.message)}`);

  const { data, error } = await supabase
    .from("violation_photos")
    .insert({
      organization_id: organizationId,
      violation_id: payload.violation_id,
      storage_path: path,
      caption: payload.caption,
      created_by: userId
    })
    .select("id")
    .single();
  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);

  await writeActivity(supabase, organizationId, userId, "violation_photo.uploaded", "violation_photos", data.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Violation evidence uploaded.")}`);
}

export async function inviteMember(formData: FormData) {
  const returnTo = "/dashboard/settings";
  const { supabase, userId, organizationId } = await requireOrgContext(returnTo);
  const payload = parseForm(inviteSchema, formData);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect(`${returnTo}?error=${encodeURIComponent("SUPABASE_SERVICE_ROLE_KEY is required to send invitations.")}`);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(payload.email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/invite`
  });

  if (error) redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`);
  if (!data.user) redirect(`${returnTo}?error=${encodeURIComponent("Supabase did not return an invited user.")}`);

  await admin.from("profiles").upsert({
    id: data.user.id,
    email: payload.email
  });

  const { error: membershipError } = await admin.from("memberships").upsert({
    organization_id: organizationId,
    user_id: data.user.id,
    role: payload.role,
    status: "invited",
    invited_by: userId
  });

  if (membershipError) redirect(`${returnTo}?error=${encodeURIComponent(membershipError.message)}`);
  await writeActivity(supabase, organizationId, userId, "member.invited", "memberships", data.user.id);
  revalidatePath(returnTo);
  redirect(`${returnTo}?message=${encodeURIComponent("Invitation sent.")}`);
}

function getRequiredFile(formData: FormData, name: string) {
  const value = formData.get(name);
  if (!(value instanceof File) || value.size === 0) {
    throw new Error("A file is required.");
  }
  return value;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
}
