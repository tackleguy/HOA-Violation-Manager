"use server";

import { redirect } from "next/navigation";
import { env, hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function sendPasswordReset(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/reset-password?error=Supabase environment variables are required before sending recovery links.");
  }

  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`
  });

  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/reset-password?message=Recovery link sent.");
}
