"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORG_COOKIE_NAME } from "@/lib/org-cookie";
import { getCurrentMemberships } from "@/lib/services/organization-service";

export async function switchOrganization(formData: FormData) {
  const organizationId = formData.get("organization_id");
  const returnTo = String(formData.get("return_to") ?? "/dashboard");

  if (!organizationId || typeof organizationId !== "string") {
    redirect(`${returnTo}?error=${encodeURIComponent("Select an organization to switch workspaces.")}`);
  }

  const memberships = await getCurrentMemberships();
  const membership = memberships.find((entry) => entry.organization_id === organizationId);

  if (!membership) {
    redirect(`${returnTo}?error=${encodeURIComponent("You do not have access to that HOA workspace.")}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ORG_COOKIE_NAME, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath(returnTo);
  redirect(returnTo);
}
