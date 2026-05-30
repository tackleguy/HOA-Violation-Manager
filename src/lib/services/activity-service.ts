import { createClient } from "@/lib/supabase/server";

export async function getActivityLogs(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, action, target_table, target_id, metadata, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}
