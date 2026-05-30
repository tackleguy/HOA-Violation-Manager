import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseJson, requireTenantApiContext, writeApiActivity } from "@/lib/api/tenant-api";

const meetingSchema = z.object({
  title: z.string().trim().min(1),
  meeting_type: z.enum(["regular", "special", "emergency"]).default("regular"),
  scheduled_at: z.string().trim().min(1),
  location: z.string().trim().optional().nullable(),
  agenda_summary: z.string().trim().optional().nullable(),
  minutes_summary: z.string().trim().optional().nullable()
});

const meetingUpdateSchema = meetingSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(["scheduled", "in_progress", "completed", "canceled"]).optional()
});

const meetingDeleteSchema = z.object({ id: z.string().uuid() });

const meetingSelect =
  "id, title, meeting_type, scheduled_at, location, status, agenda_summary, minutes_summary, created_at, updated_at";

export async function GET() {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data, error } = await context.supabase
    .from("board_meetings")
    .select(meetingSelect)
    .eq("organization_id", context.organizationId)
    .order("scheduled_at", { ascending: true });

  if (error) return apiError(error.message, 500);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, meetingSchema);
  if (response) return response;

  const { data, error } = await context.supabase
    .from("board_meetings")
    .insert({ ...payload, organization_id: context.organizationId })
    .select(meetingSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.board_meeting.created", "board_meetings", data.id);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, meetingUpdateSchema);
  if (response) return response;

  const { id, ...updates } = payload;

  const { data, error } = await context.supabase
    .from("board_meetings")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", context.organizationId)
    .select(meetingSelect)
    .single();

  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.board_meeting.updated", "board_meetings", data.id);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const context = await requireTenantApiContext();
  if (context instanceof NextResponse) return context;

  const { data: payload, response } = await parseJson(request, meetingDeleteSchema);
  if (response) return response;

  const { error } = await context.supabase
    .from("board_meetings")
    .delete()
    .eq("id", payload.id)
    .eq("organization_id", context.organizationId);
  if (error) return apiError(error.message, 500);
  await writeApiActivity(context, "api.board_meeting.deleted", "board_meetings", payload.id);
  return NextResponse.json({ success: true });
}
