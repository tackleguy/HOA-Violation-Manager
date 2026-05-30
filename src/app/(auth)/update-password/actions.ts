"use server";

import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/update-password?error=Supabase environment variables are required before updating passwords.");
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    redirect("/update-password?error=Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    redirect("/update-password?error=Passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/update-password?error=${encodeURIComponent(error.message)}`);

  redirect("/dashboard?message=Password updated.");
}
