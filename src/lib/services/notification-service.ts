import { formatDistanceToNow } from "date-fns";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

export type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  time: string;
};

export async function getNotificationContext() {
  if (!hasSupabasePublicEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) return null;

  return { supabase, userId: user.id, organizationId };
}

export async function getUnreadNotificationCount() {
  const context = await getNotificationContext();
  if (!context) return 0;

  const { count } = await context.supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", context.organizationId)
    .eq("user_id", context.userId)
    .is("read_at", null);

  return count ?? 0;
}

export async function getUserNotifications(limit = 25) {
  const context = await getNotificationContext();
  if (!context) return [];

  const { data } = await context.supabase
    .from("notifications")
    .select("id, title, body, read_at, created_at")
    .eq("organization_id", context.organizationId)
    .eq("user_id", context.userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getNotificationRows(): Promise<NotificationRow[]> {
  const notifications = await getUserNotifications();
  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body ?? "",
    read: Boolean(notification.read_at),
    time: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
  }));
}
