"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/env";
import { ORG_COOKIE_NAME } from "@/lib/org-cookie";
import { cookies } from "next/headers";

export async function signOut() {
  if (!hasSupabasePublicEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(ORG_COOKIE_NAME);

  redirect("/login?message=You have been signed out.");
}
