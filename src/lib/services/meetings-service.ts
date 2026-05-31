import { hasSupabasePublicEnv } from "@/lib/env";
import { formatDateTime, formatLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/services/organization-service";
import { createClient } from "@/lib/supabase/server";

async function getTenantContext() {
  if (!hasSupabasePublicEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const organizationId = await getDefaultOrganizationId();
  if (!organizationId) return null;

  return { supabase, organizationId };
}

export async function getMeetingRows() {
  const context = await getTenantContext();
  if (!context) return [];

  const { data: meetings } = await context.supabase
    .from("board_meetings")
    .select("id, title, meeting_type, scheduled_at, location, status")
    .eq("organization_id", context.organizationId)
    .order("scheduled_at", { ascending: true })
    .limit(25);

  if (!meetings?.length) return [];

  return meetings.map((meeting) => ({
    _id: meeting.id,
    _href: `/dashboard/meetings/${meeting.id}`,
    title: meeting.title,
    type: formatLabel(meeting.meeting_type),
    scheduled: formatDateTime(meeting.scheduled_at),
    location: meeting.location ?? "TBD",
    status: formatLabel(meeting.status)
  }));
}

export async function getMeetingDetail(id: string) {
  const context = await getTenantContext();
  if (!context) return null;

  const { data: meeting } = await context.supabase
    .from("board_meetings")
    .select("*")
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (!meeting) return null;

  const { data: agendaItems } = await context.supabase
    .from("meeting_agenda_items")
    .select("id, sort_order, title, description, presenter, duration_minutes")
    .eq("meeting_id", id)
    .order("sort_order", { ascending: true });

  return {
    ...meeting,
    meeting_agenda_items: agendaItems ?? []
  };
}
