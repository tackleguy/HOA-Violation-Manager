"use server";

import { requireOrgContext, requireWritePermission } from "@/lib/auth/context";
import {
  addAgendaItemSchema,
  createMeetingSchema,
  deleteMeetingSchema,
  updateMeetingSchema,
  updateMeetingStatusSchema
} from "@/lib/validation/schemas";
import { finishMutation, parseForm } from "./utils";

const returnTo = "/dashboard/meetings";
const paths = [returnTo, "/dashboard"];

export async function createBoardMeeting(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(createMeetingSchema, formData);
  const result = await ctx.supabase
    .from("board_meetings")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Board meeting scheduled.",
    action: "board_meeting.created",
    targetTable: "board_meetings",
    result
  });
}

export async function updateBoardMeeting(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, ...payload } = parseForm(updateMeetingSchema, formData);
  const result = await ctx.supabase
    .from("board_meetings")
    .update(payload)
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Board meeting updated.",
    action: "board_meeting.updated",
    targetTable: "board_meetings",
    targetId: id,
    result
  });
}

export async function updateMeetingStatus(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id, status } = parseForm(updateMeetingStatusSchema, formData);
  const result = await ctx.supabase
    .from("board_meetings")
    .update({ status })
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Meeting status updated.",
    action: "board_meeting.status_updated",
    targetTable: "board_meetings",
    targetId: id,
    result
  });
}

export async function addAgendaItem(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const payload = parseForm(addAgendaItemSchema, formData);
  const result = await ctx.supabase
    .from("meeting_agenda_items")
    .insert({ ...payload, organization_id: ctx.organizationId })
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Agenda item added.",
    action: "meeting_agenda_item.created",
    targetTable: "meeting_agenda_items",
    result
  });
}

export async function deleteBoardMeeting(formData: FormData) {
  const ctx = await requireOrgContext(returnTo);
  requireWritePermission(ctx, returnTo);
  const { id } = parseForm(deleteMeetingSchema, formData);
  const result = await ctx.supabase
    .from("board_meetings")
    .delete()
    .eq("id", id)
    .eq("organization_id", ctx.organizationId)
    .select("id")
    .single();
  await finishMutation(ctx, {
    returnTo,
    paths,
    successMessage: "Board meeting removed.",
    action: "board_meeting.deleted",
    targetTable: "board_meetings",
    targetId: id,
    result
  });
}
