"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/env";
import { ORG_COOKIE_NAME } from "@/lib/org-cookie";
import { cookies } from "next/headers";

const signupSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  organization_name: z.string().trim().min(2, "Organization name is required.")
});

function slugifyOrganizationName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "hoa-workspace";
}

async function provisionOrganization(userId: string, name: string, slug: string) {
  const admin = createAdminClient();

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .insert({ name, slug })
    .select("id")
    .single();

  if (organizationError) {
    throw new Error(organizationError.message);
  }

  const { error: membershipError } = await admin.from("memberships").insert({
    organization_id: organization.id,
    user_id: userId,
    role: "hoa_admin",
    status: "active"
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return organization.id;
}

export async function signUpWithOrganization(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/signup?error=Supabase environment variables are required before creating an account.");
  }

  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid signup details.")}`);
  }

  const { full_name, email, password, organization_name } = parsed.data;
  const slug = slugifyOrganizationName(organization_name);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    redirect("/signup?error=Supabase did not return a new user record.");
  }

  let organizationId: string | null = null;

  if (data.session) {
    const { data: rpcOrganizationId, error: rpcError } = await supabase.rpc("create_organization", {
      org_name: organization_name,
      org_slug: slug
    });

    if (rpcError) {
      redirect(`/signup?error=${encodeURIComponent(rpcError.message)}`);
    }

    organizationId = rpcOrganizationId;
  } else {
    try {
      organizationId = await provisionOrganization(data.user.id, organization_name, slug);
    } catch (provisionError) {
      const message = provisionError instanceof Error ? provisionError.message : "Unable to create organization.";
      redirect(`/signup?error=${encodeURIComponent(message)}`);
    }
  }

  if (organizationId) {
    const cookieStore = await cookies();
    cookieStore.set(ORG_COOKIE_NAME, organizationId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
  }

  redirect("/dashboard?message=Welcome to HOAFlow. Your workspace is ready.");
}
