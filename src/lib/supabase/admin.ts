import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAdminEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireSupabaseAdminEnv();

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
