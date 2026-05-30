import { Gavel } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/dashboard/detail-page";
import { RecordForm } from "@/components/dashboard/record-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatLabel } from "@/lib/format";
import { getMeetingDetail } from "@/lib/services/meetings-service";
import { addAgendaItem, updateBoardMeeting, updateMeetingStatus } from "../../actions";

const statusOptions = ["scheduled", "in_progress", "completed", "canceled"].map((value) => ({
  value,
  label: formatLabel(value)
}));

export default async function MeetingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const meeting = await getMeetingDetail(id);
  if (!meeting) notFound();

  const timeline = [
    {
      id: "scheduled",
      title: "Meeting scheduled",
      description: meeting.agenda_summary ?? meeting.title,
      timestamp: formatDateTime(meeting.scheduled_at)
    },
    ...meeting.meeting_agenda_items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? undefined,
      timestamp: item.presenter ? `Presenter: ${item.presenter}` : "Agenda item"
    }))
  ];

  return (
    <div className="space-y-4">
      {query.message ? <p className="text-sm text-primary">{query.message}</p> : null}
      {query.error ? <p className="text-sm text-destructive">{query.error}</p> : null}
      <DetailPage
        title={meeting.title}
        subtitle={`${formatLabel(meeting.meeting_type)} · ${formatDateTime(meeting.scheduled_at)}`}
        status={meeting.status}
        icon={Gavel}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/meetings">Back to list</Link>
          </Button>
        }
        timeline={timeline}
        tabs={[
          {
            id: "details",
            label: "Details",
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Meeting details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Type</p>
                    <p className="text-sm font-medium">{formatLabel(meeting.meeting_type)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Scheduled</p>
                    <p className="text-sm font-medium">{formatDateTime(meeting.scheduled_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{meeting.location ?? "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Status</p>
                    <p className="text-sm font-medium">{formatLabel(meeting.status)}</p>
                  </div>
                  {meeting.agenda_summary ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Agenda summary</p>
                      <p className="text-sm">{meeting.agenda_summary}</p>
                    </div>
                  ) : null}
                  {meeting.minutes_summary ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Minutes summary</p>
                      <p className="text-sm">{meeting.minutes_summary}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          },
          {
            id: "agenda",
            label: "Agenda",
            content: (
              <div className="space-y-4">
                <RecordForm
                  title="Add agenda item"
                  submitLabel="Add item"
                  action={addAgendaItem}
                  fields={[
                    { name: "meeting_id", label: "Meeting", type: "hidden", defaultValue: id },
                    {
                      name: "sort_order",
                      label: "Sort order",
                      defaultValue: String(meeting.meeting_agenda_items.length)
                    },
                    { name: "title", label: "Title", required: true },
                    { name: "description", label: "Description", type: "textarea" },
                    { name: "presenter", label: "Presenter" },
                    { name: "duration_minutes", label: "Duration (minutes)" }
                  ]}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Agenda items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {meeting.meeting_agenda_items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No agenda items yet.</p>
                    ) : (
                      meeting.meeting_agenda_items.map((item) => (
                        <div key={item.id} className="rounded-md border p-3">
                          <p className="text-sm font-medium">
                            {item.sort_order + 1}. {item.title}
                          </p>
                          {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.presenter ? `${item.presenter}` : "No presenter"}
                            {item.duration_minutes ? ` · ${item.duration_minutes} min` : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          },
          {
            id: "workflow",
            label: "Workflow",
            content: (
              <RecordForm
                title="Update status"
                submitLabel="Save status"
                action={updateMeetingStatus}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    defaultValue: meeting.status,
                    selectOptions: statusOptions
                  }
                ]}
              />
            )
          },
          {
            id: "edit",
            label: "Edit",
            content: (
              <RecordForm
                title="Edit meeting"
                submitLabel="Save changes"
                action={updateBoardMeeting}
                fields={[
                  { name: "id", label: "ID", type: "hidden", defaultValue: id },
                  { name: "title", label: "Meeting title", required: true, defaultValue: meeting.title },
                  {
                    name: "meeting_type",
                    label: "Meeting type",
                    type: "select",
                    defaultValue: meeting.meeting_type,
                    selectOptions: ["regular", "special", "emergency"].map((value) => ({ value, label: formatLabel(value) }))
                  },
                  {
                    name: "scheduled_at",
                    label: "Scheduled for",
                    type: "datetime-local",
                    required: true,
                    defaultValue: meeting.scheduled_at.slice(0, 16)
                  },
                  { name: "location", label: "Location", defaultValue: meeting.location ?? "" },
                  { name: "agenda_summary", label: "Agenda summary", type: "textarea", defaultValue: meeting.agenda_summary ?? "" },
                  { name: "minutes_summary", label: "Minutes summary", type: "textarea", defaultValue: meeting.minutes_summary ?? "" }
                ]}
              />
            )
          }
        ]}
      />
    </div>
  );
}
