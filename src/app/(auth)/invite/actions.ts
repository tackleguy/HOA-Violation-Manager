"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/env";

const inviteSchema = z
  .object({
    full_name: z.string().trim().min(1, "Full name is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string().min(8, "Confirm your password.")
  })
  .refine((values) => values.password === values.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"]
  });

export async function acceptInvite(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/invite?error=Supabase environment variables are required before accepting an invitation.");
  }

  const parsed = inviteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    redirect(`/invite?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid invitation details.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/invite&error=Sign in with your invitation email before completing setup.");
  }

  const { full_name, password } = parsed.data;

  const { error: passwordError } = await supabase.auth.updateUser({
    password,
    data: { full_name }
  });

  if (passwordError) {
    redirect(`/invite?error=${encodeURIComponent(passwordError.message)}`);
  }

  const { error: profileError } = await supabase.from("profiles").update({ full_name }).eq("id", user.id);
  if (profileError) {
    redirect(`/invite?error=${encodeURIComponent(profileError.message)}`);
  }

  const { data: membership, error: membershipLookupError } = await supabase
    .from("memberships")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "invited")
    .maybeSingle();

  if (membershipLookupError) {
    redirect(`/invite?error=${encodeURIComponent(membershipLookupError.message)}`);
  }

  if (!membership) {
    redirect("/dashboard?message=Your account is already active.");
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .update({ status: "active" })
    .eq("id", membership.id)
    .eq("user_id", user.id)
    .eq("status", "invited");

  if (membershipError) {
    redirect(`/invite?error=${encodeURIComponent(membershipError.message)}`);
  }

  redirect("/dashboard?message=Welcome to HOAFlow. Your invitation is now active.");
}
