"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { provisionOrganizationForUser, setOrganizationCookie, slugifyOrganizationName } from "@/lib/auth/provision-organization";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  organization_name: z.string().trim().min(2, "Organization name is required.")
});

export async function createWorkspace(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/onboarding?error=Supabase is not configured.");
  }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect(`/onboarding?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid details.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const slug = slugifyOrganizationName(parsed.data.organization_name);
  const organizationId = await provisionOrganizationForUser(supabase, {
    organization_name: parsed.data.organization_name,
    organization_slug: slug
  });

  if (!organizationId) {
    redirect("/onboarding?error=Unable to create workspace.");
  }

  await setOrganizationCookie(organizationId);
  revalidatePath("/", "layout");
  redirect("/dashboard?message=Workspace created.");
}
