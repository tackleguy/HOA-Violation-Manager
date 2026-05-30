"use server";

import { redirect } from "next/navigation";
import { env, hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/login?error=Supabase environment variables are required before signing in.");
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect(next);
}

export async function signInWithMagicLink(formData: FormData) {
  if (!hasSupabasePublicEnv()) {
    redirect("/login?error=Supabase environment variables are required before sending magic links.");
  }
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard` }
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?message=Check your email for a secure sign-in link.");
}
