import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = requireSupabasePublicEnv();

  return createServerClient<Database>(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot set cookies. Middleware refreshes sessions before render.
          }
        }
      }
    }
  );
}
